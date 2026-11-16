// ============================================================
// subject-dock.js: on phones and tablets the eight subject cards stacked
// to ~1300px of scrolling. This folds them into one row of course-code tabs
// with a single card open. It opens on the class that is live or next
// (read from the Live Class Status box), else the last one you picked.
// Desktop (>1024px) keeps the full two-column grid: the tabs are hidden there.
// ============================================================

(function () {
  const KEY = "linkeen:dock";
  const CODE = /\b[A-Z]{4}\d{3}\b/g;

  const css = `
    .sd-tabs { display: none; }
    @media (max-width: 1024px) {
      .sd-tabs { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; margin: 4px 0 10px;
        padding: 2px 1px 4px; scroll-snap-type: x proximity; }
      .sd-tabs::-webkit-scrollbar { display: none; }
      .sd-tab { --c: var(--accent); flex: none; scroll-snap-align: start; display: inline-flex; align-items: center; gap: 6px;
        padding: 7px 11px; border-radius: 10px; cursor: pointer; position: relative;
        font: 600 .74rem/1 var(--font-mono, monospace); letter-spacing: .02em; color: var(--text-muted);
        background: color-mix(in srgb, var(--surface-elevated) 78%, transparent);
        border: 1px solid color-mix(in srgb, var(--text) 12%, transparent); transition: background .15s, color .15s, border-color .15s; }
      .sd-tab::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: var(--c); flex: none; }
      .sd-tab[aria-selected="true"] { color: var(--text); border-color: var(--c);
        background: color-mix(in srgb, var(--c) 16%, var(--surface-elevated)); }
      .sd-tab.now::after { content: attr(data-tag); font: 700 .58rem/1 var(--font-sans, Inter, sans-serif); text-transform: uppercase;
        letter-spacing: .06em; padding: 2px 4px; border-radius: 4px; color: var(--surface); background: var(--accent); }
      .links.sd-on .course-card:not(.sd-active) { display: none !important; }
      .links.sd-on .course-card.sd-active { animation: sd-in .18s ease both; }
      @keyframes sd-in { from { opacity: 0; transform: translateY(4px); } }
    }
    @media (prefers-reduced-motion: reduce) { .links.sd-on .course-card.sd-active { animation: none; } }`;

  // first known code in the live box; "next" if it sits after an UP NEXT label
  function liveCode(codes) {
    const box = document.getElementById("live-class-status");
    if (!box) return {};
    const t = box.textContent, code = (t.match(CODE) || []).find((c) => codes.includes(c));
    if (!code) return {};
    const nx = t.search(/NEXT|SESSION AT/i);
    return { code, tag: nx >= 0 && nx < t.indexOf(code) ? "next" : "now" };
  }

  function build(links, cards) {
    const codes = cards.map((c) => {
      const code = (c.querySelector(".course-code") || {}).textContent || "";
      c.dataset.code = code.trim();
      return c.dataset.code;
    });
    const st = document.createElement("style");
    st.textContent = css;
    document.head.appendChild(st);

    const tabs = document.createElement("div");
    tabs.className = "sd-tabs";
    tabs.setAttribute("role", "tablist");
    tabs.setAttribute("aria-label", "Subjects");
    tabs.innerHTML = cards.map((c, i) => `<button type="button" role="tab" class="sd-tab" data-i="${i}"
      style="--c:${c.style.getPropertyValue("--course-color") || "var(--accent)"}">${codes[i]}</button>`).join("");
    links.before(tabs);
    links.classList.add("sd-on");

    const btns = [...tabs.children];
    function pick(i, save) {
      i = (i + cards.length) % cards.length;
      cards.forEach((c, j) => c.classList.toggle("sd-active", j === i));
      btns.forEach((b, j) => b.setAttribute("aria-selected", String(j === i)));
      if (save) { try { localStorage.setItem(KEY, codes[i]); } catch (e) {} }
      const b = btns[i];
      tabs.scrollTo({ left: b.offsetLeft - tabs.clientWidth / 2 + b.offsetWidth / 2, behavior: save ? "smooth" : "auto" });
      cur = i;
    }
    let cur = 0;
    btns.forEach((b, i) => b.onclick = () => pick(i, true));

    // swipe across the open card to step subjects
    let x0 = null, y0 = 0;
    links.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    links.addEventListener("touchend", (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) pick(cur + (dx < 0 ? 1 : -1), true);
    }, { passive: true });

    function mark() {
      const { code, tag } = liveCode(codes);
      btns.forEach((b, i) => { b.classList.toggle("now", codes[i] === code); if (codes[i] === code) b.dataset.tag = tag; });
      return code;
    }
    let saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    const live = mark();
    const start = codes.indexOf(live) >= 0 ? codes.indexOf(live) : Math.max(0, codes.indexOf(saved));
    pick(start, false);

    // the live box re-renders every minute; keep the "now" tag honest
    const box = document.getElementById("live-class-status");
    if (box) new MutationObserver(mark).observe(box, { childList: true, subtree: true });
  }

  let tries = 0;
  (function wait() {
    const links = document.querySelector(".links");
    const cards = links ? [...links.querySelectorAll(":scope > .course-card")] : [];
    if (cards.length > 1) return build(links, cards);
    if (++tries < 40) setTimeout(wait, 100);
  })();
})();
