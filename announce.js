// ============================================================
// announce.js — site-wide announcements, a slim bar at the top of every page.
//
// Edit ANNOUNCEMENTS below and push. Each one:
//   id       unique, never reuse (dismissals are remembered by id)
//   text     one or two short sentences, plain text
//   link     optional page or URL, with linkText (default "Open")
//   from     optional "YYYY-MM-DD", first day it shows (default: now)
//   until    "YYYY-MM-DD", last day it shows (inclusive)
//   level    "info" | "new" | "urgent"; urgent comes back a day after ✕
//   skip     optional paths it should not show on, e.g. ["/exams"]
// At most MAX_SHOWN appear at once, urgent first. Shipped with the site,
// so it works offline (rerun tools/build_offline.py after editing).
// ============================================================

const ANNOUNCEMENTS = [
  {
    id: "midsem-2026-portions",
    text: "Mid-sems run 24–29 Oct. Portions and searchable slides for every paper are on the Exams page.",
    link: "/exams", linkText: "Portions & slides",
    until: "2026-10-29", level: "info", skip: ["/exams"]
  },
  {
    id: "offline-app-2026-10",
    text: "linkeen now works with no wifi and installs as an app (Android: Install button · iPhone: Share → Add to Home Screen).",
    until: "2026-10-31", level: "new"
  }
];

(function () {
  const MAX_SHOWN = 2;
  const URGENT_SNOOZE_MS = 24 * 3600 * 1000;
  const ICON = { info: "📣", new: "✨", urgent: "⚠️" };

  function day(s, end) {
    const [y, m, d] = s.split("-").map(Number);
    return end ? new Date(y, m - 1, d, 23, 59, 59) : new Date(y, m - 1, d);
  }
  function dismissedAt(id) { try { return Number(localStorage.getItem(`announce:${id}`)) || 0; } catch (e) { return 0; } }
  function dismiss(id) { try { localStorage.setItem(`announce:${id}`, String(Date.now())); } catch (e) {} }

  function path() {
    let p = location.pathname.replace(/\.html$/, "");
    return p === "/index" ? "/" : p;
  }

  function visible(now) {
    return ANNOUNCEMENTS.filter((a) => {
      if (a.from && now < day(a.from)) return false;
      if (!a.until || now > day(a.until, true)) return false;
      if (a.skip && a.skip.includes(path())) return false;
      const t = dismissedAt(a.id);
      if (!t) return true;
      return a.level === "urgent" && now - t > URGENT_SNOOZE_MS;
    }).sort((a, b) => (b.level === "urgent") - (a.level === "urgent")).slice(0, MAX_SHOWN);
  }

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  const CSS = `
    #announce { display: grid; gap: 1px; position: relative; z-index: 50;
      font: 500 13.5px/1.45 Inter, system-ui, -apple-system, "Segoe UI", sans-serif; }
    #announce .an { display: flex; align-items: center; gap: 10px;
      padding: 8px max(14px, env(safe-area-inset-right, 0px)) 8px max(14px, env(safe-area-inset-left, 0px));
      background: #e3ebc8; color: #1c2e1f; border-bottom: 1px solid #c4cd9f; }
    #announce .an.urgent { background: #f6dcc4; border-bottom-color: #e2b48b; }
    #announce .an-ico { flex: none; }
    #announce .an-text { flex: 1; min-width: 0; overflow-wrap: anywhere; }
    #announce .an-link { flex: none; font-weight: 600; color: #2c6a26; text-decoration: underline; white-space: nowrap; }
    #announce .an.urgent .an-link { color: #8a3b0c; }
    #announce .an-x { flex: none; width: 26px; height: 26px; border-radius: 50%; border: 0; cursor: pointer;
      background: transparent; color: inherit; font-size: 15px; line-height: 1; opacity: .65; }
    #announce .an-x:hover, #announce .an-x:focus-visible { opacity: 1; background: rgba(0,0,0,.08); outline: none; }
    :root[data-theme="dark"] #announce .an { background: #16261e; color: #e1ecd9; border-bottom-color: #2c4737; }
    :root[data-theme="dark"] #announce .an.urgent { background: #3a2414; border-bottom-color: #6b4022; }
    :root[data-theme="dark"] #announce .an-link { color: #83e07d; }
    :root[data-theme="dark"] #announce .an.urgent .an-link { color: #ffb27a; }
    :root[data-theme="dark"] #announce .an-x:hover { background: rgba(255,255,255,.1); }
    @media (prefers-color-scheme: dark) { :root:not([data-theme]) #announce .an { background: #16261e; color: #e1ecd9; border-bottom-color: #2c4737; }
      :root:not([data-theme]) #announce .an-link { color: #83e07d; } }
    @media (max-width: 560px) { #announce .an { font-size: 12.5px; } }`;

  function render() {
    const list = visible(new Date());
    let bar = document.getElementById("announce");
    if (!list.length) { if (bar) bar.remove(); return; }
    if (!document.getElementById("announce-css")) {
      const st = document.createElement("style");
      st.id = "announce-css";
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "announce";
      bar.setAttribute("role", "region");
      bar.setAttribute("aria-label", "Announcements");
      document.body.prepend(bar);
    }
    bar.innerHTML = list.map((a) => `
      <div class="an ${a.level || "info"}">
        <span class="an-ico" aria-hidden="true">${ICON[a.level] || ICON.info}</span>
        <span class="an-text">${esc(a.text)}</span>
        ${a.link ? `<a class="an-link" href="${esc(a.link)}">${esc(a.linkText || "Open")} →</a>` : ""}
        <button type="button" class="an-x" data-id="${esc(a.id)}" aria-label="Dismiss announcement">✕</button>
      </div>`).join("");
    bar.querySelectorAll(".an-x").forEach((b) => b.addEventListener("click", () => { dismiss(b.dataset.id); render(); }));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})();
