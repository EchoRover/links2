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
//   at       optional "YYYY-MM-DD" event day; the card counts down to it
//   until    "YYYY-MM-DD" or "YYYY-MM-DDTHH:MM", last moment it shows; the note
//            expires by itself after that (falls back to `at` if missing)
//   level    "info" | "new" | "urgent"; urgent comes back a day after hiding
//   skip     optional paths it should not show on, e.g. ["/exams"]
// Shipped with the site, so it works offline (rerun tools/build_offline.py
// after editing).
// ============================================================

const ANNOUNCEMENTS = [
  { id: "convocation-2026", text: "IITD-AD's first Convocation, for the first M.Tech batch.",
    at: "2026-11-19", from: "2026-11-15", until: "2026-11-19", level: "new" },
  { id: "aenl226-quiz-tue-2026", text: "AENL226 quiz likely moved to Tue 24 Nov 12:30-13:30 (watch for sir's confirmation). Formula sheet allowed. New: DC-AC part 3 slides.",
    at: "2026-11-24", from: "2026-11-22", until: "2026-11-24T13:30", level: "urgent", link: "files", linkText: "Files" },
  { id: "sun22-friday-2026", text: "Sun 22 Nov runs Friday's timetable, online.",
    at: "2026-11-22", from: "2026-11-16", until: "2026-11-22", level: "info" },
  { id: "national-day-2026", text: "National Day break 2-4 Dec. Mon 30 Nov runs Thursday's timetable, Tue 1 Dec runs Friday's, with the National Day celebration on campus after 12:00.",
    at: "2026-11-30", from: "2026-11-20", until: "2026-12-04", level: "info", link: "week", linkText: "Week" },
  { id: "friday-bus-2026", text: "Fridays run their own shuttle sheet: no trips 12:30-1:15, last day run 6:30 PM.",
    link: "bus", linkText: "Bus", from: "2026-11-06", until: "2026-11-20", level: "info" }
];

(function () {
  const URGENT_SNOOZE_MS = 24 * 3600 * 1000;
  const ROTATE_MS = 7000;
  const WORD = { info: "notice", new: "new", urgent: "heads up" };
  const RANK = { urgent: 0, new: 1, info: 2 };
  const DAY = 86400000;

  // "YYYY-MM-DD" or "YYYY-MM-DDTHH:MM"; a bare `until` date lasts to 23:59
  function day(s, end) {
    if (s.includes("T")) return new Date(s);
    const [y, m, d] = s.split("-").map(Number);
    return end ? new Date(y, m - 1, d, 23, 59, 59) : new Date(y, m - 1, d);
  }
  const get = (k) => { try { return Number(localStorage.getItem(k)) || 0; } catch (e) { return 0; } };
  const set = (k) => { try { localStorage.setItem(k, String(Date.now())); } catch (e) {} };

  function path() {
    const p = location.pathname.replace(/\.html$/, "");
    return p === "/index" ? "/" : p;
  }

  // expired notes (past `until`, or past `at` when there is no until) drop out by themselves
  function live(now) {
    return ANNOUNCEMENTS.concat(window.LINKEEN ? LINKEEN.announcements() : []).filter((a) => {
      if (a.from && now < day(a.from)) return false;
      const end = a.until || a.at;
      if (!end || now > day(end, true)) return false;
      return !(a.skip && a.skip.includes(path()));
    }).sort((a, b) => (RANK[a.level] ?? 2) - (RANK[b.level] ?? 2)
      || (a.at ? day(a.at) : Infinity) - (b.at ? day(b.at) : Infinity));
  }
  function isHidden(a, now) {
    const t = get(`announce:${a.id}`);
    if (!t) return false;
    return !(a.level === "urgent" && now - t > URGENT_SNOOZE_MS);
  }

  // "today", "tomorrow", "Thu", "in 9 days", "till Fri", "ends today"
  function when(a, now) {
    const t0 = new Date(now); t0.setHours(0, 0, 0, 0);
    const span = (s) => Math.round((day(s) - t0) / DAY);
    const wd = (s) => day(s).toLocaleDateString("en-GB", { weekday: "short" });
    if (a.at && span(a.at) >= 0) {
      const n = span(a.at);
      return n === 0 ? "today" : n === 1 ? "tomorrow" : n < 7 ? wd(a.at) : `in ${n} days`;
    }
    if (!a.until) return "";
    const u = span(a.until);
    return u <= 0 ? "ends today" : u === 1 ? "till tomorrow" : u < 7 ? `till ${wd(a.until)}` : "";
  }

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  const CSS = `
    .an-card { --an-tone: var(--accent);
      position: relative; margin: 0 0 14px; padding: 12px 14px 10px; border-radius: 14px;
      background: var(--surface-elevated); color: var(--text);
      border: 1px solid var(--border-soft);
      background-image: linear-gradient(90deg, color-mix(in srgb, var(--an-tone) 10%, transparent), transparent 55%);
      font: 400 14px/1.45 var(--font-sans, Inter, system-ui, sans-serif); }
    .an-card.urgent, .an-pop .urgent { --an-tone: #d4572a; }
    .an-card.new, .an-pop .new { --an-tone: var(--accent-warm); }
    .an-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
    .an-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--an-tone); flex: none; }
    .an-card.unread .an-dot, .an-pill.unread .an-dot { animation: an-pulse 1.8s ease-in-out 3; }
    @keyframes an-pulse { 0%,100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--an-tone) 55%, transparent); }
      50% { box-shadow: 0 0 0 5px transparent; } }
    .an-word { font: 600 10.5px/1 var(--font-mono, monospace); letter-spacing: .08em; text-transform: uppercase; color: var(--an-tone); }
    .an-when { font: 600 11px/1 var(--font-sans, Inter, system-ui, sans-serif); padding: 3px 7px; border-radius: 999px;
      color: var(--an-tone); background: color-mix(in srgb, var(--an-tone) 14%, transparent); }
    .an-btn { margin-left: auto; border: 0; background: none; color: var(--text-subtle); cursor: pointer;
      width: 26px; height: 26px; border-radius: 7px; font-size: 16px; line-height: 1; padding: 0; }
    .an-btn:hover, .an-btn:focus-visible { background: color-mix(in srgb, var(--text) 8%, transparent); outline: none; color: var(--text); }
    .an-text { margin: 0; overflow-wrap: anywhere; font-weight: 500; }
    .an-link { font-weight: 600; color: var(--accent-strong); white-space: nowrap; margin-left: 4px; }
    .an-segs { display: flex; gap: 4px; margin-top: 10px; }
    .an-seg { flex: 1; height: 3px; border: 0; padding: 0; border-radius: 3px; cursor: pointer; overflow: hidden;
      background: color-mix(in srgb, var(--text) 12%, transparent); position: relative; }
    .an-seg::after { content: ""; position: absolute; inset: 0; background: var(--an-tone); transform-origin: left; transform: scaleX(0); }
    .an-seg.done::after { transform: scaleX(1); }
    .an-seg.on::after { animation: an-fill ${ROTATE_MS}ms linear forwards; }
    .an-card.paused .an-seg.on::after { animation-play-state: paused; }
    @keyframes an-fill { to { transform: scaleX(1); } }
    .an-mini { display: inline-flex; align-items: center; gap: 7px; margin: 0 0 12px; padding: 4px 10px;
      border-radius: 999px; border: 1px dashed var(--border); background: none; cursor: pointer;
      color: var(--text-muted); font: 500 12px/1.4 var(--font-sans, Inter, system-ui, sans-serif); }
    .an-mini .an-dot { --an-tone: var(--text-subtle); }
    .an-pill { position: fixed; left: max(14px, env(safe-area-inset-left, 0px)); bottom: max(14px, env(safe-area-inset-bottom, 0px));
      z-index: 60; display: inline-flex; align-items: center; gap: 7px; padding: 7px 12px; border-radius: 999px;
      border: 1px solid var(--border-soft); background: var(--surface-elevated); color: var(--text);
      box-shadow: 0 4px 14px rgba(0,0,0,.14); cursor: pointer; font: 500 12.5px/1 var(--font-sans, Inter, system-ui, sans-serif); }
    .an-pill .an-dot { --an-tone: var(--accent); }
    .an-pill.has-urgent .an-dot { --an-tone: #d4572a; }
    .an-pop { position: fixed; left: max(14px, env(safe-area-inset-left, 0px)); bottom: calc(max(14px, env(safe-area-inset-bottom, 0px)) + 42px);
      z-index: 60; width: min(340px, calc(100vw - 28px)); display: grid; gap: 8px; padding: 10px;
      border-radius: 14px; border: 1px solid var(--border-soft); background: var(--surface);
      box-shadow: 0 10px 30px rgba(0,0,0,.2); }
    .an-pop .an-card { margin: 0; }
    @media (prefers-reduced-motion: reduce) { .an-dot { animation: none !important; } .an-seg.on::after { animation: none; transform: scaleX(1); } }
    @media print { .an-card, .an-pill, .an-pop, .an-mini { display: none; } }`;

  function css() {
    if (document.getElementById("announce-css")) return;
    const st = document.createElement("style");
    st.id = "announce-css";
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  // one notice; nav = [index, total] on the home card
  function card(a, nav) {
    const unread = !get(`announce-seen:${a.id}`);
    const w = when(a, Date.now());
    return `<div class="an-card ${a.level || "info"}${unread ? " unread" : ""}" role="status">
      <div class="an-row">
        <span class="an-dot" aria-hidden="true"></span>
        <span class="an-word">${WORD[a.level] || WORD.info}</span>
        ${w ? `<span class="an-when">${w}</span>` : ""}
        ${nav ? `<button type="button" class="an-btn" data-hide aria-label="Hide notices" title="Hide">×</button>` : ""}
      </div>
      <p class="an-text">${esc(a.text)}${a.link ? ` <a class="an-link" href="${esc(a.link)}">${esc(a.linkText || "Open")} →</a>` : ""}</p>
      ${nav && nav[1] > 1 ? `<div class="an-segs">${Array.from({ length: nav[1] }, (_, i) =>
        `<button type="button" class="an-seg${i < nav[0] ? " done" : i === nav[0] ? " on" : ""}" data-go="${i}" aria-label="Notice ${i + 1} of ${nav[1]}"></button>`).join("")}</div>` : ""}
    </div>`;
  }

  // ---------- home: inline card, auto-advancing like stories ----------
  let idx = 0, timer = null, paused = false;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function homeSlot() {
    const narrow = window.matchMedia("(max-width: 1024px)").matches;
    const side = document.querySelector(".side-col");
    const grid = document.querySelector(".body-grid");
    if (!narrow && side) return { parent: side, before: side.firstChild };
    if (grid) return { parent: grid.parentNode, before: grid };
    return null;
  }

  function renderHome(list) {
    clearTimeout(timer);
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
    const el = box.firstElementChild;
    if (paused) el.classList.add("paused");
    box.querySelectorAll("[data-go]").forEach((b) => b.onclick = () => { idx = Number(b.dataset.go); renderHome(list); });
    box.querySelector("[data-hide]").onclick = () => { shown.forEach((x) => set(`announce:${x.id}`)); renderHome(list); };
    let x0 = null;   // swipe to step
    el.ontouchstart = (e) => { x0 = e.touches[0].clientX; };
    el.ontouchend = (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) { idx += dx < 0 ? 1 : -1; renderHome(list); }
    };
    if (shown.length > 1 && !reduce) {
      let left = ROTATE_MS, t0 = Date.now();
      const go = () => { t0 = Date.now(); timer = setTimeout(() => { paused = false; idx++; renderHome(list); }, left); };
      el.onmouseenter = () => { if (paused) return; paused = true; el.classList.add("paused"); clearTimeout(timer); left -= Date.now() - t0; };
      el.onmouseleave = () => { if (!paused) return; paused = false; el.classList.remove("paused"); go(); };
      if (paused) { paused = false; el.classList.remove("paused"); }
      go();
    }
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
  window.addEventListener("linkeen:overrides", () => {
    document.querySelectorAll("#announce, .an-pill, .an-pop").forEach((el) => el.remove());
    init();
  });
})();
