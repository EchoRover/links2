// install-wall.js: on phones in a normal browser tab, shows install steps and
// why installing helps (notifications), with a "Continue in browser" button.
// Desktop is never walled. Load it synchronously in <head>:
//   <script src="install-wall.js" data-name="linkeen" data-bg="#06120a" data-fg="#e6f4e8" data-accent="#00c24a"></script>
// Escape hatch (testing): open any page with ?letmein once; ?wall turns it back on.
(function () {
  const me = document.currentScript;
  const cfg = (k, d) => (me && me.dataset[k]) || d;
  const NAME = cfg("name", document.title);
  const ua = navigator.userAgent;
  const iOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const android = /Android/.test(ua);
  const standalone = matchMedia("(display-mode: standalone)").matches
    || matchMedia("(display-mode: fullscreen)").matches || navigator.standalone === true;

  const q = new URLSearchParams(location.search);
  try {
    if (q.has("letmein")) localStorage.setItem("install-wall-off", "1");
    if (q.has("wall")) localStorage.removeItem("install-wall-off");
    if (localStorage.getItem("install-wall-off") === "1") return;
  } catch (e) { /* storage blocked: wall stays */ }
  if (!(iOS || android) || standalone) return;

  // Hide the page before it paints.
  const style = document.createElement("style");
  style.textContent = `html.iw-on,html.iw-on body{overflow:hidden!important;background:${cfg("bg", "#111")}!important}
  html.iw-on body{display:none!important}
  #iw{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:24px 16px;
    background:${cfg("bg", "#111")};color:${cfg("fg", "#eee")};font:16px/1.5 system-ui,-apple-system,sans-serif;text-align:left}
  html #iw :not(svg,svg *){all:revert;box-sizing:border-box;font-family:system-ui,-apple-system,sans-serif;color:inherit}
  html #iw .iw-c{display:block;max-width:360px;width:100%}
  html #iw h1{display:block;font-size:24px;font-weight:700;margin:0 0 8px;line-height:1.2}
  html #iw p{display:block;margin:0 0 16px;opacity:.8}
  html #iw ol{display:block;margin:0 0 18px;padding-left:22px}html #iw li{display:list-item;margin:8px 0}
  html #iw b{font-weight:700;color:${cfg("accent", "#4c8")}}
  html #iw button{display:block;width:100%;padding:13px;border:0;border-radius:10px;font-size:16px;font-weight:600;cursor:pointer;
    background:${cfg("accent", "#4c8")};color:#000;margin:0 0 10px}
  html #iw svg{display:inline;width:18px;height:18px;vertical-align:-3px;fill:none;stroke:currentColor}
  html #iw path{fill:none;stroke:currentColor}
  html #iw ul{display:block;margin:0 0 16px;padding-left:20px;font-size:14px;opacity:.85}html #iw ul li{margin:4px 0}
  html #iw #iw-skip{background:transparent;color:inherit;border:1px solid currentColor;opacity:.7;margin-top:4px}`;
  document.documentElement.classList.add("iw-on");
  document.head.appendChild(style);

  let deferred = null;
  addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e; render(); });
  addEventListener("appinstalled", () => { deferred = null; render(true); });

  const share = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>';
  const inApp = /FBAN|FBAV|Instagram|WhatsApp|Line\/|Snapchat|TikTok|; wv\)/.test(ua);
  const iosOther = iOS && /FxiOS|EdgiOS|OPiOS/.test(ua);

  function render(installed) {
    // Lives on <html>, outside <body>, so frameworks that hydrate body never see it.
    let box = document.getElementById("iw");
    if (!box) { box = document.createElement("div"); box.id = "iw"; document.documentElement.appendChild(box); }
    let html = `<div class="iw-c"><h1>Add ${NAME} to your Home Screen</h1>`;
    if (installed) {
      html += `<p>Installed. Close this tab and open <b>${NAME}</b> from your Home Screen.</p>`;
    } else if (inApp || iosOther) {
      html += `<p>This app can only be installed from ${iOS ? "Safari" : "Chrome"}.</p>
        <ol><li>Copy the link below.</li><li>Open it in <b>${iOS ? "Safari" : "Chrome"}</b>.</li><li>Follow the steps there.</li></ol>
        <button id="iw-copy">Copy link</button>`;
    } else if (iOS) {
      html += `<p>${NAME} runs as an app on your phone. It takes 10 seconds.</p>
        <ol><li>Tap <b>Share</b> ${share} at the bottom (or top) of the browser.</li>
        <li>Scroll down, tap <b>Add to Home Screen</b>.</li>
        <li>Open <b>${NAME}</b> from your Home Screen.</li></ol>`;
    } else if (deferred) {
      html += `<p>${NAME} runs as an app on your phone. One tap.</p><button id="iw-go">Install ${NAME}</button>
        <p>Then open it from your Home Screen.</p>`;
    } else {
      html += `<p>${NAME} runs as an app on your phone.</p>
        <ol><li>Tap the browser menu <b>⋮</b>.</li><li>Tap <b>Install app</b> or <b>Add to Home screen</b>.</li>
        <li>Open <b>${NAME}</b> from your Home Screen.</li></ol>`;
    }
    if (!installed) html += `<p style="margin:0 0 6px;font-weight:600;opacity:1">Why install it</p><ul><li>Class reminders 10 minutes before</li><li>Shuttle pings until you reach campus</li><li>Deadline and exam alerts the evening before</li><li>Works with no wifi</li></ul>
      ${iOS ? "<p style=\"font-size:13px\">On iPhone, notifications only work from the installed app.</p>" : ""}
      <button id="iw-skip">Continue in browser</button>`;
    box.innerHTML = html + "</div>";
    document.getElementById("iw-skip")?.addEventListener("click", () => {
      try { localStorage.setItem("install-wall-off", "1"); } catch (e) {}
      box.remove(); style.remove(); document.documentElement.classList.remove("iw-on");
    });
    const go = document.getElementById("iw-go");
    if (go) go.onclick = async () => { deferred.prompt(); const r = await deferred.userChoice; if (r.outcome === "accepted") render(true); };
    const copy = document.getElementById("iw-copy");
    if (copy) copy.onclick = () => navigator.clipboard.writeText(location.origin + location.pathname)
      .then(() => { copy.textContent = "Copied"; }, () => { copy.textContent = location.origin; });
  }
  render();
})();
