// files.js: browse every file in notes/ (notes/files.json) by course, sort it,
// and search names plus the text inside every PDF page (notes/index.json).
// Rebuild both JSON files with: python tools/build_slide_index.py
(function () {
  const NAMES = {
    AENL226: "Power Electronics & Power Systems", AENL228: "Measurement & Instrumentation",
    AENP200: "Energy Technology Lab", AENP225: "Electrical Energy Lab", AGRL130: "Entrepreneurship",
    AHUL256: "Critical Thinking", AHUL261: "Psychology", ASBL100: "Biology",
  };
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const pretty = (path) => path.split("/").pop().replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
  const size = (kb) => (kb >= 1024 ? (kb / 1024).toFixed(1) + " MB" : kb + " KB");

  const q = new URLSearchParams(location.search);
  let files = [], text = null, course = q.get("c") || "", sort = "course", query = q.get("q") || "";

  function hits(path) {
    if (!text || query.length < 3) return [];
    const i = text.byFile[path.replace(/\.pdf$/i, "")];
    if (i === undefined) return [];
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return text.pages.filter(([fi, , t]) => fi === i && words.every((w) => t.toLowerCase().includes(w)));
  }

  function snippet(t) {
    const w = query.toLowerCase().split(/\s+/)[0];
    const at = Math.max(0, t.toLowerCase().indexOf(w) - 50);
    const s = esc(t.slice(at, at + 150));
    return (at ? "…" : "") + s.replace(new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig"), (m) => `<mark>${m}</mark>`) + "…";
  }

  function render() {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    let list = files
      .filter((f) => !course || f.code === course)
      .map((f) => {
        const nameHit = words.every((w) => (f.title + " " + f.code + " " + f.ext).toLowerCase().includes(w));
        const pageHits = words.length ? hits(f.path) : [];
        return { ...f, nameHit, pageHits };
      })
      .filter((f) => !words.length || f.nameHit || f.pageHits.length);

    const by = {
      course: (a, b) => a.code.localeCompare(b.code) || a.title.localeCompare(b.title, undefined, { numeric: true }),
      name: (a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }),
      size: (a, b) => b.kb - a.kb,
    }[sort];
    if (words.length) list.sort((a, b) => (b.nameHit - a.nameHit) || (b.pageHits.length - a.pageHits.length) || by(a, b));
    else list.sort(by);

    $("files-count").textContent = `${list.length} file${list.length === 1 ? "" : "s"}`;
    if (!list.length) { $("files-list").innerHTML = `<p class="files-empty">Nothing matches.</p>`; return; }

    let html = "", last = "";
    for (const f of list) {
      if (sort === "course" && !words.length && f.code !== last) {
        html += `<h2 class="files-group">${f.code} <span>${esc(NAMES[f.code] || "")}</span></h2>`;
        last = f.code;
      }
      const meta = [f.code, f.pages ? f.pages + " pages" : "", size(f.kb)].filter(Boolean).join(" · ");
      html += `<div class="files-row">
        <a class="files-main" href="notes/${encodeURI(f.path)}" target="_blank" rel="noopener">
          <span class="files-ext files-ext-${f.ext}">${f.ext}</span>
          <span class="files-text"><b>${esc(f.title)}</b><small>${meta}</small></span>
        </a>
        ${f.pageHits.slice(0, 3).map(([, p, t]) => `<a class="files-hit" href="notes/${encodeURI(f.path)}#page=${p}" target="_blank" rel="noopener"><em>p.${p}</em> ${snippet(t)}</a>`).join("")}
        ${f.pageHits.length > 3 ? `<span class="files-more">+${f.pageHits.length - 3} more pages</span>` : ""}
      </div>`;
    }
    $("files-list").innerHTML = html;
  }

  function chips() {
    const counts = {};
    files.forEach((f) => { counts[f.code] = (counts[f.code] || 0) + 1; });
    $("files-courses").innerHTML = [["", "All", files.length], ...Object.keys(counts).sort().map((c) => [c, c, counts[c]])]
      .map(([c, label, n]) => `<button type="button" data-c="${c}" class="${c === course ? "on" : ""}">${label} <span>${n}</span></button>`).join("");
  }

  async function loadText() {
    if (text) return;
    try {
      const d = await (await fetch("notes/index.json")).json();
      text = { pages: d.pages, byFile: Object.fromEntries(d.files.map((f, i) => [f, i])) };
    } catch (e) { text = { pages: [], byFile: {} }; }
  }

  $("files-courses").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    course = b.dataset.c; chips(); render();
    history.replaceState(null, "", course ? "?c=" + course : location.pathname);
  });
  $("files-sort").addEventListener("change", (e) => { sort = e.target.value; render(); });
  let t;
  $("files-q").addEventListener("input", (e) => {
    query = e.target.value.trim();
    clearTimeout(t);
    t = setTimeout(async () => { if (query.length >= 3) await loadText(); render(); }, 150);
  });

  // scripts.js isn't loaded on sub-pages, so the theme toggle is wired here.
  const tt = $("theme-toggle");
  if (tt) tt.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) { /* fine */ }
  });

  fetch("notes/files.json").then((r) => r.json()).then(async (rows) => {
    files = rows.map(([path, kb, pages, added]) => ({
      path, kb, pages, added, code: path.split("/")[0], title: pretty(path),
      ext: (path.split(".").pop() || "").toLowerCase(),
    }));
    $("files-q").value = query;
    if (query.length >= 3) await loadText();
    chips(); render();
  }).catch(() => { $("files-list").innerHTML = `<p class="files-empty">Couldn't load the file list.</p>`; });
})();
