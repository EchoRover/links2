// ============================================================
// offline.js — on every page: registers sw.js, shows an "offline" pill
// when there's no connection, and tells the service worker to save every
// slide deck so the whole site works without wifi.
//
// The worker does the downloading (~80 MB, three at a time), so it keeps
// going when you switch pages, and resumes on the next visit if cut off.
// It starts on every visit, mobile data included: the point is that the
// whole site is on your phone after one open.
// window.linkeenOffline exposes status() and saveSlides() for /exams.
// ============================================================

(function () {
  if (!("serviceWorker" in navigator) || !window.caches) return;

  const SLIDE_CACHE = "linkeen-slides";
  let slideList = null;
  let done = null;
  const listeners = new Set();
  let last = null;

  navigator.serviceWorker.register("/sw.js").catch(() => {});

  navigator.serviceWorker.addEventListener("message", (e) => {
    const d = e.data || {};
    if (d.type === "slides") slideList = d.slides;
    if (d.type === "progress") {
      last = d;
      listeners.forEach((fn) => fn(d));
      if (!d.saving && done) { done(); done = null; }
    }
  });

  function worker() {
    return navigator.serviceWorker.ready.then((reg) => navigator.serviceWorker.controller || reg.active);
  }

  function askSlides() {
    if (slideList) return Promise.resolve(slideList);
    return worker().then((w) => new Promise((resolve) => {
      const t = setInterval(() => { if (slideList) { clearInterval(t); resolve(slideList); } }, 50);
      w.postMessage("slides?");
    }));
  }

  async function status() {
    const list = await askSlides();
    const cache = await caches.open(SLIDE_CACHE);
    const have = new Set((await cache.keys()).map((r) => new URL(r.url).pathname));
    return { total: list.length, saved: list.filter((s) => have.has(s)).length, saving: !!(last && last.saving) };
  }

  function saveSlides() {
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
    return worker().then((w) => new Promise((resolve) => {
      done = resolve;
      w.postMessage("save");
    }));
  }

  // ---------- offline pill ----------
  function pill() {
    let el = document.getElementById("offline-pill");
    if (!navigator.onLine) {
      if (!el) {
        el = document.createElement("div");
        el.id = "offline-pill";
        el.setAttribute("role", "status");
        el.textContent = "offline · saved copy";
        el.style.cssText = "position:fixed;left:50%;bottom:calc(14px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);" +
          "z-index:9999;padding:6px 14px;border-radius:999px;font:600 12px/1.4 system-ui,sans-serif;letter-spacing:.04em;" +
          "background:var(--text,#222);color:var(--surface,#fff);box-shadow:0 4px 14px rgba(0,0,0,.25);pointer-events:none";
        document.body.appendChild(el);
      }
    } else if (el) el.remove();
  }

  window.addEventListener("online", () => { pill(); saveSlides(); });
  window.addEventListener("offline", pill);
  window.addEventListener("load", () => {
    pill();
    if (navigator.onLine) saveSlides().catch(() => {});
  });

  // ---------- "Install" button (home top bar) ----------
  // Only appears when the browser says the site can be installed (Chrome /
  // Edge / Android fire beforeinstallprompt), and goes away once it is. iOS
  // has no such event: there it's Share → Add to Home Screen, no button.
  let installEvent = null;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    installEvent = e;
    const bar = document.querySelector(".topbar-actions");
    if (!bar || location.pathname !== "/" || document.getElementById("install-btn")) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "install-btn";
    btn.className = "button";
    btn.textContent = "Install";
    btn.title = "Install linkeen as an app (works offline)";
    btn.addEventListener("click", async () => {
      if (!installEvent) return;
      installEvent.prompt();
      await installEvent.userChoice.catch(() => {});
      installEvent = null;
      btn.remove();
    });
    bar.prepend(btn);
  });
  window.addEventListener("appinstalled", () => {
    installEvent = null;
    const btn = document.getElementById("install-btn");
    if (btn) btn.remove();
  });

  window.linkeenOffline = {
    status, saveSlides,
    onChange(fn) { listeners.add(fn); }
  };
})();
