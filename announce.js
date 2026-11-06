// ============================================================
// announce.js — site-wide announcements.
//
// Home page: one compact card in the layout (side column on desktop, under
// the hero on phones), one notice at a time with ‹ › to step through.
// Every other page: a small pill in the bottom-left corner; tap it for the
// list. Nothing sits on top of the page anymore.
//
// Edit ANNOUNCEMENTS below and push. Each one:
//   id       unique, never reuse (read/hidden state is remembered by id)
//   text     one or two short sentences, plain text
//   link     optional page or URL, with linkText (default "Open")
//   from     optional "YYYY-MM-DD", first day it shows (default: now)
//   until    "YYYY-MM-DD", last day it shows (inclusive)
//   level    "info" | "new" | "urgent"; urgent comes back a day after hiding
//   skip     optional paths it should not show on, e.g. ["/exams"]
// Shipped with the site, so it works offline (rerun tools/build_offline.py
// after editing).
// ============================================================

const ANNOUNCEMENTS = [
  { id: "deepawali-2026", text: "Mon 9 Nov is a holiday (Deepawali). Sun 22 Nov runs Friday's timetable, online.",
    from: "2026-11-02", until: "2026-11-22", level: "info" },
  { id: "aenl228-labexam-2026", text: "AENL228 lab exam: G1 Thu 12 Nov in the regular lab slot, 16:00-17:50, M2-2-031. Can't make it? Contact Ravi sir.",
    from: "2026-11-04", until: "2026-11-12", level: "urgent" },
  { id: "friday-bus-2026", text: "Fridays now run their own shuttle sheet: no trips 12:30-1:15, last day run 6:30 PM, night shift as usual.",
    link: "bus", linkText: "Bus", from: "2026-11-06", until: "2026-11-20", level: "new" }
];

(function () {
  const URGENT_SNOOZE_MS = 24 * 3600 * 1000;
  const WORD = { info: "notice", new: "new", urgent: "heads up" };
  const RANK = { urgent: 0, new: 1, info: 2 };

  function day(s, end) {
    const [y, m, d] = s.split("-").map(Number);
    return end ? new Date(y, m - 1, d, 23, 59, 59) : new Date(y, m - 1, d);
  }
  const get = (k) => { try { return Number(localStorage.getItem(k)) || 0; } catch (e) { return 0; } };
  const set = (k) => { try { localStorage.setItem(k, String(Date.now())); } catch (e) {} };

  function path() {
    const p = location.pathname.replace(/\.html$/, "");
    return p === "/index" ? "/" : p;
  }

  function live(now) {
    return ANNOUNCEMENTS.filter((a) => {
      if (a.from && now < day(a.from)) return false;
      if (!a.until || now > day(a.until, true)) return false;
      return !(a.skip && a.skip.includes(path()));
    }).sort((a, b) => (RANK[a.level] ?? 2) - (RANK[b.level] ?? 2));
  }
  // hidden = the visitor collapsed the card while this notice was in it
  function isHidden(a, now) {
    const t = get(`announce:${a.id}`);
    if (!t) return false;
    return !(a.level === "urgent" && now - t > URGENT_SNOOZE_MS);
  }

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  const CSS = `
    .an-card { --an-tone: var(--accent, #4a9c3f);
      position: relative; margin: 0 0 14px; padding: 11px 12px 11px 16px; border-radius: 12px;
      background: var(--surface-elevated, #e8eece); color: var(--text, #1c2e1f);
      border: 1px solid var(--border-soft, #c4cd9f); box-shadow: inset 3px 0 0 var(--an-tone);
      font: 400 13.5px/1.45 var(--font-sans, Inter, system-ui, sans-serif); }
    .an-card.urgent, .an-pop .urgent { --an-tone: #c2693a; }
    .an-card.new, .an-pop .new { --an-tone: var(--accent-warm, #d49b3c); }
    .an-row { display: flex; align-items: center; gap: 8px; margin-bottom: 3px; }
    .an-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--an-tone); flex: none; }
    .an-card.unread .an-dot, .an-pill.unread .an-dot { animation: an-pulse 1.8s ease-in-out 3; }
    @keyframes an-pulse { 0%,100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--an-tone) 55%, transparent); }
      50% { box-shadow: 0 0 0 5px transparent; } }
    .an-word { font: italic 500 13px/1 var(--font-serif, Georgia, serif); color: var(--an-tone); }
    .an-n { margin-left: auto; font-size: 11.5px; color: var(--text-subtle, #5e6f5a); font-variant-numeric: tabular-nums; }
    .an-btn { border: 0; background: none; color: var(--text-muted, #455642); cursor: pointer;
      width: 24px; height: 24px; border-radius: 6px; font-size: 15px; line-height: 1; padding: 0; }
    .an-btn:hover, .an-btn:focus-visible { background: rgba(0,0,0,.07); outline: none; color: var(--text, #1c2e1f); }
    .an-text { margin: 0; overflow-wrap: anywhere; }
    .an-link { font-weight: 600; color: var(--accent-strong, #2c6a26); white-space: nowrap; margin-left: 4px; }
    .an-mini { display: inline-flex; align-items: center; gap: 7px; margin: 0 0 12px; padding: 4px 10px;
      border-radius: 999px; border: 1px dashed var(--border, #b1bd8d); background: none; cursor: pointer;
      color: var(--text-muted, #455642); font: 500 12px/1.4 var(--font-sans, Inter, system-ui, sans-serif); }
    .an-mini .an-dot { --an-tone: var(--text-subtle, #5e6f5a); }
    .an-pill { position: fixed; left: max(14px, env(safe-area-inset-left, 0px)); bottom: max(14px, env(safe-area-inset-bottom, 0px));
      z-index: 60; display: inline-flex; align-items: center; gap: 7px; padding: 7px 12px; border-radius: 999px;
      border: 1px solid var(--border-soft, #c4cd9f); background: var(--surface-elevated, #e8eece); color: var(--text, #1c2e1f);
      box-shadow: 0 4px 14px rgba(20,40,20,.14); cursor: pointer; font: 500 12.5px/1 var(--font-sans, Inter, system-ui, sans-serif); }
    .an-pill .an-dot { --an-tone: var(--accent, #4a9c3f); }
    .an-pill.has-urgent .an-dot { --an-tone: #c2693a; }
    .an-pop { position: fixed; left: max(14px, env(safe-area-inset-left, 0px)); bottom: calc(max(14px, env(safe-area-inset-bottom, 0px)) + 42px);
      z-index: 60; width: min(340px, calc(100vw - 28px)); display: grid; gap: 8px; padding: 10px;
      border-radius: 14px; border: 1px solid var(--border-soft, #c4cd9f); background: var(--surface, #dde5c1);
      box-shadow: 0 10px 30px rgba(20,40,20,.2); }
    .an-pop .an-card { margin: 0; }
    :root[data-theme="dark"] .an-card, :root[data-theme="dark"] .an-pill { background: #16261e; color: #e1ecd9; border-color: #2c4737; }
    :root[data-theme="dark"] .an-pop { background: #0f1b15; border-color: #2c4737; }
    :root[data-theme="dark"] .an-link { color: #83e07d; }
    :root[data-theme="dark"] .an-btn { color: #b9c9b2; }
    :root[data-theme="dark"] .an-btn:hover { background: rgba(255,255,255,.08); color: #fff; }
    :root[data-theme="dark"] .an-mini { color: #b9c9b2; border-color: #3a5646; }
    @media (prefers-reduced-motion: reduce) { .an-dot { animation: none !important; } }
    @media print { .an-card, .an-pill, .an-pop, .an-mini { display: none; } }`;

  function css() {
    if (document.getElementById("announce-css")) return;
    const st = document.createElement("style");
    st.id = "announce-css";
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  // one notice as a card; nav = [index, total] on the home card
  function card(a, nav) {
    const unread = !get(`announce-seen:${a.id}`);
    return `<div class="an-card ${a.level || "info"}${unread ? " unread" : ""}" role="status">
      <div class="an-row">
        <span class="an-dot" aria-hidden="true"></span>
        <span class="an-word">${WORD[a.level] || WORD.info}</span>
        ${nav && nav[1] > 1 ? `<span class="an-n">${nav[0] + 1} / ${nav[1]}</span>
          <button type="button" class="an-btn" data-step="-1" aria-label="Previous notice">‹</button>
          <button type="button" class="an-btn" data-step="1" aria-label="Next notice">›</button>` : nav ? `<span class="an-n"></span>` : ""}
        ${nav ? `<button type="button" class="an-btn" data-hide aria-label="Hide notices" title="Hide">–</button>` : ""}
      </div>
      <p class="an-text">${esc(a.text)}${a.link ? ` <a class="an-link" href="${esc(a.link)}">${esc(a.linkText || "Open")} →</a>` : ""}</p>
    </div>`;
  }

  // ---------- home: inline card ----------
  let idx = 0;
  function homeSlot() {
    const narrow = window.matchMedia("(max-width: 1024px)").matches;
    const side = document.querySelector(".side-col");
    const grid = document.querySelector(".body-grid");
    if (!narrow && side) return { parent: side, before: side.firstChild };
    if (grid) return { parent: grid.parentNode, before: grid };
    return null;
  }

  function renderHome(list) {
    const now = Date.now();
    const shown = list.filter((a) => !isHidden(a, now));
    let box = document.getElementById("announce");
    const slot = homeSlot();
    if (!slot) return false;
    if (!box) { box = document.createElement("div"); box.id = "announce"; box.setAttribute("aria-label", "Announcements"); }
    if (box.parentNode !== slot.parent || box.nextSibling !== slot.before) slot.parent.insertBefore(box, slot.before);

    if (!shown.length) {
      box.innerHTML = `<button type="button" class="an-mini" data-show><span class="an-dot" aria-hidden="true"></span>${list.length} notice${list.length > 1 ? "s" : ""}</button>`;
      box.querySelector("[data-show]").onclick = () => {
        list.forEach((a) => { try { localStorage.removeItem(`announce:${a.id}`); } catch (e) {} });
        idx = 0; renderHome(list);
      };
      return true;
    }
    idx = (idx + shown.length) % shown.length;
    const a = shown[idx];
    box.innerHTML = card(a, [idx, shown.length]);
    set(`announce-seen:${a.id}`);
    box.querySelectorAll("[data-step]").forEach((b) => b.onclick = () => { idx += Number(b.dataset.step); renderHome(list); });
    box.querySelector("[data-hide]").onclick = () => { shown.forEach((x) => set(`announce:${x.id}`)); renderHome(list); };
    return true;
  }

  // ---------- other pages: corner pill ----------
  function renderPill(list) {
    const unread = list.some((a) => !get(`announce-seen:${a.id}`));
    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = `an-pill${unread ? " unread" : ""}${list.some((a) => a.level === "urgent") ? " has-urgent" : ""}`;
    pill.setAttribute("aria-expanded", "false");
    pill.innerHTML = `<span class="an-dot" aria-hidden="true"></span>${list.length} notice${list.length > 1 ? "s" : ""}`;
    document.body.appendChild(pill);
    let pop = null;
    const close = () => { if (pop) { pop.remove(); pop = null; pill.setAttribute("aria-expanded", "false"); } };
    pill.onclick = (e) => {
      e.stopPropagation();
      if (pop) return close();
      pop = document.createElement("div");
      pop.className = "an-pop";
      pop.setAttribute("role", "dialog");
      pop.setAttribute("aria-label", "Announcements");
      pop.innerHTML = list.map((a) => card(a)).join("");
      pop.onclick = (ev) => ev.stopPropagation();
      document.body.appendChild(pop);
      pill.setAttribute("aria-expanded", "true");
      list.forEach((a) => set(`announce-seen:${a.id}`));
      pill.classList.remove("unread");
    };
    document.addEventListener("click", close);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }

  function init() {
    const list = live(new Date());
    if (!list.length) return;
    css();
    if (path() === "/" && renderHome(list)) {
      let w = window.innerWidth;
      window.addEventListener("resize", () => { if (Math.abs(window.innerWidth - w) > 40) { w = window.innerWidth; renderHome(list); } });
      return;
    }
    renderPill(list);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
