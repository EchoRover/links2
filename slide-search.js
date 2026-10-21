// ============================================================
// slide-search.js — search every slide in notes/ (exams.html only)
//
// notes/index.json holds one entry per PDF page ([fileIdx, page, text]),
// built by tools/build_slide_index.py. It is fetched on first use, not on
// load, so the page stays light for people who only want the lists.
// A hit opens the PDF at that page via #page=N. Lecture names come from
// the EXAMS topic list in exams.js, so a file only needs naming once.
// ============================================================

(function () {
  const input = document.getElementById("ss-input");
  const out = document.getElementById("ss-results");
  const list = document.getElementById("ex-list");
  if (!input || !out) return;

  const MAX_HITS = 40;
  let index = null;     // { files, pages } with lowered text added
  let loading = null;

  // file path (no .pdf) -> { code, title } or, for single decks, a section list
  function buildNames() {
    const names = {};
    for (const ex of EXAMS) {
      for (const tp of ex.topics) {
        if (typeof tp === "string" || !tp.link || !tp.link.startsWith("notes/")) continue;
        const [path, hash] = tp.link.slice(6).split("#");
        const file = path.replace(/\.pdf$/, "");
        const page = hash ? Number(hash.replace("page=", "")) : 0;
        if (!names[file]) names[file] = { code: ex.code, sections: [] };
        names[file].sections.push({ page, t: tp.t });
      }
    }
    for (const n of Object.values(names)) n.sections.sort((a, b) => a.page - b.page);
    return names;
  }

  // For a deck split into sections, the title is the last section starting at or before the page.
  function titleFor(name, page) {
    let t = name.sections[0].t;
    for (const s of name.sections) if (s.page <= page) t = s.t;
    return t;
  }

  function load() {
    if (!loading) {
      loading = fetch("notes/index.json")
        .then((r) => r.json())
        .then((data) => {
          data.lower = data.pages.map((p) => p[2].toLowerCase());
          data.names = buildNames();
          // Every word on every slide with its count: the dictionary for "Did you mean".
          data.vocab = new Map();
          for (const l of data.lower) for (const w of l.match(/[a-z]{3,}/g) || []) data.vocab.set(w, (data.vocab.get(w) || 0) + 1);
          index = data;
          if (input.value.trim()) run();
        })
        .catch(() => { out.innerHTML = `<div class="ss-empty">Couldn't load the slide index. Try again in a bit.</div>`; });
    }
    return loading;
  }

  function reEsc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  function snippet(text, lower, phrase, tokens) {
    let at = lower.indexOf(phrase);
    if (at < 0) at = Math.min(...tokens.map((t) => lower.indexOf(t)).filter((i) => i >= 0));
    const start = Math.max(0, at - 70);
    const end = Math.min(text.length, at + phrase.length + 110);
    let s = esc(text.slice(start, end));
    const re = new RegExp(`(${tokens.map((t) => reEsc(esc(t))).join("|")})`, "gi");
    s = s.replace(re, "<mark>$1</mark>");
    return (start > 0 ? "… " : "") + s + (end < text.length ? " …" : "");
  }

  function count(hay, needle) {
    let n = 0, i = hay.indexOf(needle);
    while (i >= 0) { n++; i = hay.indexOf(needle, i + needle.length); }
    return n;
  }

  function findHits(q, tokens) {
    const hits = [];
    index.lower.forEach((lower, i) => {
      if (!tokens.every((t) => lower.includes(t))) return;
      // An exact phrase beats scattered words; more mentions beat one.
      const score = count(lower, q) * 5 + tokens.reduce((s, t) => s + count(lower, t), 0);
      hits.push({ i, score });
    });
    return hits.sort((a, b) => b.score - a.score);
  }

  // Edit distance where a swapped pair of letters counts as one edit (protien -> protein).
  // Gives up early and returns max + 1 once every path is already past max.
  function editDist(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    let pp = null, p = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i++) {
      const c = [i];
      let rowMin = i;
      for (let j = 1; j <= b.length; j++) {
        let v = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, pp[j - 2] + 1);
        c[j] = v;
        if (v < rowMin) rowMin = v;
      }
      if (rowMin > max) return max + 1;
      pp = p; p = c;
    }
    return p[b.length];
  }

  // Closest slide word to a token that appears nowhere; ties go to the more common word.
  function correctWord(t) {
    if (!/^[a-z]{3,}$/.test(t) || index.lower.some((l) => l.includes(t))) return t;
    let best = t, bestD = t.length <= 4 ? 1 : t.length <= 8 ? 2 : 3, bestF = 0, found = false;
    for (const [w, f] of index.vocab) {
      const d = editDist(t, w, bestD);
      if (d < bestD || (d === bestD && f > bestF)) { best = w; bestD = d; bestF = f; found = true; }
    }
    return found ? best : t;
  }

  let literal = "";  // a query the user chose to search as typed, skipping correction

  function run() {
    const raw = input.value.trim();
    let q = raw.toLowerCase();
    const searching = q.length >= 2;
    list.hidden = searching;
    if (!searching) { out.innerHTML = ""; return; }
    if (!index) { out.innerHTML = `<div class="ss-empty">Loading slides…</div>`; load(); return; }

    let tokens = q.split(/\s+/).filter((t) => t.length >= 2);
    if (!tokens.length) { out.innerHTML = ""; return; }

    let hits = findHits(q, tokens), note = "";
    // Nothing found: fix misspelled words against the slide vocabulary, like Google does.
    if (!hits.length && raw !== literal) {
      const fixed = tokens.map(correctWord);
      if (fixed.some((t, i) => t !== tokens[i])) {
        const fq = fixed.join(" "), fhits = findHits(fq, fixed);
        if (fhits.length) {
          const shownQ = fixed.map((t, i) => (t !== tokens[i] ? `<b><i>${esc(t)}</i></b>` : esc(t))).join(" ");
          note = `<div class="ss-dym">Did you mean <span class="ss-fix">${shownQ}</span>? Showing results for that.
            <button type="button" class="ss-link" data-literal>Search for “${esc(raw)}” instead</button></div>`;
          hits = fhits; q = fq; tokens = fixed;
        }
      }
    }

    if (!hits.length) {
      out.innerHTML = `<div class="ss-empty">No slide mentions “${esc(raw)}”.</div>`;
      return;
    }

    const shown = hits.slice(0, MAX_HITS);
    const head = note + `<div class="ss-count">${hits.length} slide${hits.length === 1 ? "" : "s"}${hits.length > MAX_HITS ? `, top ${MAX_HITS} shown` : ""}</div>`;
    out.innerHTML = head + shown.map(({ i }) => {
      const [fi, page, text] = index.pages[i];
      const file = index.files[fi];
      const name = index.names[file];
      const code = name ? name.code : file.split("/")[0];
      const title = name ? titleFor(name, page) : file.split("/")[1];
      const clr = (typeof COURSE_COLORS !== "undefined" && COURSE_COLORS[code]) || "var(--accent)";
      return `
        <a class="ss-hit" style="--c:${clr}" href="notes/${file}.pdf#page=${page}" target="_blank" rel="noopener">
          <div class="ss-top">
            <span class="ss-code">${code}</span>
            <span class="ss-title">${esc(title)}</span>
            <span class="ss-page">p. ${page}</span>
          </div>
          <div class="ss-snip">${snippet(text, index.lower[i], q, tokens)}</div>
        </a>`;
    }).join("");
  }

  out.addEventListener("click", (e) => {
    if (e.target.closest("[data-literal]")) { literal = input.value.trim(); run(); }
  });

  let timer = 0;
  input.addEventListener("focus", load, { once: true });
  input.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(run, 120); });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { input.value = ""; run(); }
  });
  // "/" jumps to the box, like most search UIs.
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== input && !/input|textarea/i.test(document.activeElement.tagName)) {
      e.preventDefault();
      input.focus();
    }
  });
})();
