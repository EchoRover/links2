// ============================================================
// offline.js — on every page: registers sw.js, shows an "offline" pill
// when there's no connection, and saves all slides in the background so
// the whole site works without wifi.
//
// Slides (~80 MB) download after the first visit, three at a time, and
// resume on the next visit if interrupted. Skipped on mobile data or Data
// Saver; /exams has a "Save now" button that overrides that.
// window.linkeenOffline exposes status() and saveSlides() for /exams.
// ============================================================

(function () {
  if (!("serviceWorker" in navigator) || !window.caches) return;

  const SLIDE_CACHE = "linkeen-slides";
  let slideList = null;
  let saving = null;
  const listeners = new Set();

  navigator.serviceWorker.register("/sw.js").catch(() => {});

  function askSlides() {
    if (slideList) return Promise.resolve(slideList);
    return navigator.serviceWorker.ready.then((reg) => new Promise((resolve) => {
      const onMsg = (e) => {
        if (e.data && e.data.type === "slides") {
          navigator.serviceWorker.removeEventListener("message", onMsg);
          slideList = e.data.slides;
          resolve(slideList);
        }
      };
      navigator.serviceWorker.addEventListener("message", onMsg);
      (navigator.serviceWorker.controller || reg.active).postMessage("slides?");
    }));
  }

  async function status() {
    const list = await askSlides();
    const cache = await caches.open(SLIDE_CACHE);
    const have = new Set((await cache.keys()).map((r) => new URL(r.url).pathname));
    return { total: list.length, saved: list.filter((s) => have.has(s)).length, saving: !!saving };
  }

  function emit(s) { listeners.forEach((fn) => fn(s)); }

  function saveSlides() {
    if (saving) return saving;
    saving = (async () => {
      if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
      const list = await askSlides();
      const cache = await caches.open(SLIDE_CACHE);
      const have = new Set((await cache.keys()).map((r) => new URL(r.url).pathname));
      const todo = list.filter((s) => !have.has(s));
      let saved = list.length - todo.length;
      emit({ total: list.length, saved, saving: true });
      const worker = async () => {
        while (todo.length) {
          const s = todo.shift();
          try { await cache.add(s); saved++; } catch (e) { /* lost connection: next visit resumes */ }
          emit({ total: list.length, saved, saving: true });
        }
      };
      await Promise.all([worker(), worker(), worker()]);
      saving = null;
      emit({ total: list.length, saved, saving: false });
    })();
    return saving;
  }

  function onMeteredConnection() {
    const c = navigator.connection;
    return !!(c && (c.saveData || c.type === "cellular"));
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

  window.addEventListener("online", () => { pill(); if (!onMeteredConnection()) saveSlides(); });
  window.addEventListener("offline", pill);
  window.addEventListener("load", () => {
    pill();
    // Let the page settle first; slides are a background job.
    if (navigator.onLine && !onMeteredConnection()) setTimeout(() => saveSlides().catch(() => {}), 4000);
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
