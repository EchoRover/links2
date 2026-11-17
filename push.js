// push.js: the bell in the topbar. Opt in to notifications (announcements,
// deadlines the evening before, classes ~10 min before) and pick a group.
// Prefs are stored server-side with the subscription (api/push/subscribe.js),
// mirrored in localStorage so the panel shows the current choice.
(function () {
  const API = window.LINKEEN_API || "https://linkeen-api.vercel.app";
  const KEY = "linkeen-push";
  const bar = document.querySelector(".topbar-actions");
  if (!bar) return;

  const css = document.createElement("style");
  css.textContent = `
  #push-btn svg{width:18px;height:18px}
  #push-btn.on{color:var(--accent-strong)}
  .push-panel{position:absolute;right:0;top:calc(100% + 8px);z-index:60;width:min(280px,calc(100vw - 32px));
    background:var(--surface-elevated);border:1px solid var(--border);border-radius:10px;padding:12px;
    box-shadow:0 8px 24px rgba(0,0,0,.18);font:13px/1.4 var(--font-sans);color:var(--text)}
  .push-panel[hidden]{display:none}
  .push-panel b{display:block;font-size:14px;margin-bottom:6px}
  .push-panel label{display:flex;gap:8px;align-items:center;padding:3px 0;cursor:pointer}
  .push-panel .row{display:flex;gap:6px;margin:6px 0 10px}
  .push-panel .row button{flex:1;padding:4px 0;border:1px solid var(--border);border-radius:6px;background:none;color:inherit;cursor:pointer}
  .push-panel .row button[aria-pressed=true]{background:var(--accent-soft);border-color:var(--accent)}
  .push-panel .go{width:100%;padding:7px;border:0;border-radius:6px;background:var(--accent);color:#fff;font-weight:600;cursor:pointer}
  .push-panel .go.off{background:none;border:1px solid var(--border);color:var(--text-muted);margin-top:6px}
  .push-panel small{display:block;color:var(--text-muted);margin-top:8px}`;
  document.head.appendChild(css);

  const wrap = document.createElement("div");
  wrap.style.position = "relative";
  wrap.innerHTML = `
    <button class="button" id="push-btn" type="button" aria-label="Notifications" title="Notifications" aria-expanded="false">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
      </svg>
    </button>
    <div class="push-panel" hidden>
      <b>Notifications</b>
      <label><input type="checkbox" data-k="news" checked> New announcements</label>
      <label><input type="checkbox" data-k="deadline" checked> Deadlines, the evening before</label>
      <label><input type="checkbox" data-k="class"> Class starting in 10 min</label>
      <div class="row" data-group><button data-g="0">Both</button><button data-g="1">G1</button><button data-g="2">G2</button></div>
      <button class="go" type="button">Turn on</button>
      <button class="go off" type="button" hidden>Turn off</button>
      <small></small>
    </div>`;
  bar.insertBefore(wrap, document.getElementById("theme-toggle"));

  const btn = wrap.querySelector("#push-btn");
  const panel = wrap.querySelector(".push-panel");
  const go = panel.querySelector(".go:not(.off)");
  const off = panel.querySelector(".go.off");
  const note = panel.querySelector("small");
  const groupRow = panel.querySelector("[data-group]");

  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(KEY) || "null"); } catch { /* storage blocked */ }
  let prefs = saved || { news: true, deadline: true, class: false, group: 0 };

  const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent);

  function paint() {
    panel.querySelectorAll("input[data-k]").forEach((i) => { i.checked = !!prefs[i.dataset.k]; });
    groupRow.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.g === prefs.group)));
    groupRow.style.opacity = prefs.class ? 1 : 0.4;
    btn.classList.toggle("on", !!saved);
    go.textContent = saved ? "Save" : "Turn on";
    off.hidden = !saved;
    if (!supported) {
      go.disabled = true;
      note.textContent = isIOS ? "On iPhone: Share → Add to Home Screen, open linkeen from there, then tap the bell."
                               : "This browser can't do notifications.";
    }
  }

  async function subscription() {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      const { key } = await (await fetch(API + "/api/push/subscribe")).json();
      if (!key) throw new Error("not set up yet");
      const raw = atob(key.replace(/-/g, "+").replace(/_/g, "/"));
      sub = await reg.pushManager.subscribe({ userVisibleOnly: true,
        applicationServerKey: Uint8Array.from(raw, (c) => c.charCodeAt(0)) });
    }
    return sub;
  }

  go.addEventListener("click", async () => {
    note.textContent = "…";
    try {
      if ((await Notification.requestPermission()) !== "granted") throw new Error("notifications are blocked for this site");
      const sub = await subscription();
      const r = await fetch(API + "/api/push/subscribe", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sub: sub.toJSON(), prefs }) });
      if (!r.ok) throw new Error((await r.json()).error || r.status);
      saved = prefs;
      try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch { /* fine */ }
      note.textContent = "On. You'll get the ones ticked above.";
    } catch (e) { note.textContent = "Couldn't turn on: " + e.message; }
    paint();
  });

  off.addEventListener("click", async () => {
    try {
      const sub = await (await navigator.serviceWorker.ready).pushManager.getSubscription();
      if (sub) {
        await fetch(API + "/api/push/subscribe", { method: "DELETE", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }) }).catch(() => {});
        await sub.unsubscribe();
      }
    } catch { /* already gone */ }
    saved = null;
    try { localStorage.removeItem(KEY); } catch { /* fine */ }
    note.textContent = "Off.";
    paint();
  });

  panel.addEventListener("change", (e) => { if (e.target.dataset.k) { prefs = { ...prefs, [e.target.dataset.k]: e.target.checked }; paint(); } });
  groupRow.addEventListener("click", (e) => { const g = e.target.dataset.g; if (g != null) { prefs = { ...prefs, group: +g }; paint(); } });
  btn.addEventListener("click", () => { panel.hidden = !panel.hidden; btn.setAttribute("aria-expanded", String(!panel.hidden)); });
  document.addEventListener("click", (e) => { if (!wrap.contains(e.target)) panel.hidden = true; });
  paint();
})();
