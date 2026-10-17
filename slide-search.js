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

  function run() {
    const q = input.value.trim().toLowerCase();
    const searching = q.length >= 2;
    list.hidden = searching;
    if (!searching) { out.innerHTML = ""; return; }
    if (!index) { out.innerHTML = `<div class="ss-empty">Loading slides…</div>`; load(); return; }

    const tokens = q.split(/\s+/).filter((t) => t.length >= 2);
    if (!tokens.length) { out.innerHTML = ""; return; }

    const hits = [];
    index.lower.forEach((lower, i) => {
      if (!tokens.every((t) => lower.includes(t))) return;
      // An exact phrase beats scattered words; more mentions beat one.
      const score = count(lower, q) * 5 + tokens.reduce((s, t) => s + count(lower, t), 0);
      hits.push({ i, score });
    });
    hits.sort((a, b) => b.score - a.score);

    if (!hits.length) {
      out.innerHTML = `<div class="ss-empty">No slide mentions “${esc(input.value.trim())}”.</div>`;
      return;
    }

    const shown = hits.slice(0, MAX_HITS);
    const head = `<div class="ss-count">${hits.length} slide${hits.length === 1 ? "" : "s"}${hits.length > MAX_HITS ? `, top ${MAX_HITS} shown` : ""}</div>`;
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
