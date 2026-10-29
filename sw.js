// ============================================================
// sw.js — makes linkeen work with no wifi.
//
// On install it saves every page, script, style and image (SHELL) and the
// Google Fonts (FONTS). Then it downloads every slide deck (SLIDES) itself,
// so leaving the page or hopping between pages doesn't cut the download.
// offline.js nudges it on every visit; a half-finished run resumes. After that:
//   pages      network first (3 s), saved copy when offline or slow
//   slides     saved copy first, they never change once posted
//   assets     saved copy at once, refreshed from the network behind it
//   fonts/CDN  saved copy first
//   /api/      always network (mess reports queue themselves when offline)
//
// The lists below are generated: run `python tools/build_offline.py`
// after changing any file, so VERSION changes and phones pick it up.
// ============================================================

// <offline-manifest> written by tools/build_offline.py, do not edit by hand
const VERSION = "0ba442f68436";
const SHELL = [
"/404",
"/announce.js",
"/archive",
"/archive.js",
"/assets/boards/M3_G.jpg",
"/assets/boards/M3_G2.jpg",
"/assets/boards/M3_G_gem.jpg",
"/assets/boards/M3_L1.jpg",
"/assets/boards/M3_L1_gem.jpg",
"/assets/boards/M4_G.jpg",
"/assets/boards/M4_G_gem.jpg",
"/assets/boards/M4_L1.jpg",
"/assets/boards/M4_L1_gem.jpg",
"/assets/boo/crawler.jpg",
"/assets/boo/face.jpg",
"/assets/boo/hag.jpg",
"/assets/boo/job-application.png",
"/assets/box.webp",
"/assets/circle.webp",
"/assets/hacker.webp",
"/assets/text.webp",
"/assets/timetable-sem5-2026-08-23.pdf",
"/assets/zu-abu-dhabi-campus-map.pdf",
"/boards-data.js",
"/both",
"/building.js",
"/bus-core.js",
"/bus-locate.js",
"/bus-next.css",
"/bus-next.js",
"/bus",
"/bus.js",
"/campus-data.js",
"/campus-tools-data.js",
"/campus",
"/campus.js",
"/campustools",
"/campustools.js",
"/cgpa",
"/cgpa.js",
"/common",
"/common.js",
"/energypong",
"/exam-day.css",
"/exam-day.js",
"/exam-mode.css",
"/exam-mode.js",
"/exams-over.js",
"/exams",
"/exams.js",
"/extras/topics-ahul",
"/flappybird",
"/flappycell.css",
"/free",
"/games.css",
"/games.js",
"/gamesscript.js",
"/gridgambit",
"/icons/apple-touch-icon.png",
"/icons/icon-192.png",
"/icons/icon-512.png",
"/icons/maskable-512.png",
"/image.png",
"/",
"/jumpscare.js",
"/m2-data.js",
"/m2",
"/m3-data.js",
"/m3",
"/m4-data.js",
"/m4",
"/manifest.webmanifest",
"/mascot.css",
"/mascot.js",
"/mess-data-gen.js",
"/mess-data.js",
"/mess-next",
"/mess-next.js",
"/mess",
"/mess.js",
"/night-mode.png",
"/offline.js",
"/planedit",
"/planedit.js",
"/rooms-data.js",
"/rooms",
"/rooms.js",
"/scripts.js",
"/shared.js",
"/slide-search.js",
"/snake.css",
"/snake",
"/snake.js",
"/styles-cs.css",
"/styles.css",
"/sustainability.png",
"/theme-init.js",
"/timetable.js",
"/timetable.pdf",
"/timetables",
"/timetables.js",
"/ui.js",
"/vendor/three.r128.min.js",
"/vercel.json",
"/week",
"/week.js",
"/notes/index.json"
];
const FONTS = [
"https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&family=Inter:wght@400;500;600&family=Source+Serif+4:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap",
"https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Source+Serif+4:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap",
"https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Source+Serif+4:ital,wght@0,400;0,500;0,600;1,400;1,500&family=JetBrains+Mono:wght@400;500;600&display=swap",
"https://fonts.googleapis.com/css2?family=Creepster&family=Special+Elite&display=swap",
"https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@1,400;1,500;1,600&family=Familjen+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap",
"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Source+Serif+4:ital,wght@0,400;0,500;1,400;1,500&display=swap",
"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Caveat:wght@500;600;700&display=swap"
];
const SLIDES = [
"/notes/AENL226/PE-L1-introduction.pdf",
"/notes/AENL226/PE-L2-power-switches.pdf",
"/notes/AENL226/PE-L3-switch-losses.pdf",
"/notes/AENL226/PE-L4-dc-dc-part1.pdf",
"/notes/AENL226/PE-problem-set-1.pdf",
"/notes/AENL226/PE-problem-sheet-2.pdf",
"/notes/AENL226/PS-L1-course-overview.pdf",
"/notes/AENL226/PS-L2-3-system-modelling.pdf",
"/notes/AENL226/PS-L4-per-unit.pdf",
"/notes/AENL226/PS-L5-component-models-bus-types.pdf",
"/notes/AENL226/PS-L6-7-power-flow-ybus.pdf",
"/notes/AENL226/PS-notes-with-L6.pdf",
"/notes/AENL226/PS-power-flow-notes.pdf",
"/notes/AENL226/PS-ybus-formation.pdf",
"/notes/AENL226/T1-per-unit.pdf",
"/notes/AENL226/T2-ybus-branch-data.pdf",
"/notes/AENL226/T2-ybus.pdf",
"/notes/AENL226/T3-newton-raphson-data.pdf",
"/notes/AENL226/T3-power-flow.pdf",
"/notes/AENL226/T4-complex-power.pdf",
"/notes/AENL226/T5-switch-losses-thermal.pdf",
"/notes/AENL226/T6-buck-boost.pdf",
"/notes/AENL228/assignment-1.pdf",
"/notes/AENL228/module-1-slides.pdf",
"/notes/AENL228/module-2-slides-part-1.pdf",
"/notes/AHUL256/critical-thinking-slides.pdf",
"/notes/AHUL261/01-introduction.pdf",
"/notes/AHUL261/02-history-of-psychology.pdf",
"/notes/AHUL261/03-thinking-like-a-psych-scientist.pdf",
"/notes/AHUL261/04-research-designs.pdf",
"/notes/AHUL261/05-self-and-identity.pdf",
"/notes/AHUL261/06-sensation-and-perception.pdf",
"/notes/AHUL261/07-conditioning-and-learning.pdf",
"/notes/AHUL261/08-memory-and-forgetting.pdf",
"/notes/ASBL100/L01-introduction.pdf",
"/notes/ASBL100/L02-evolution-origin-of-life.pdf",
"/notes/ASBL100/L03-evolution.pdf",
"/notes/ASBL100/L05-dna.pdf",
"/notes/ASBL100/L06-genetics-heredity-1.pdf",
"/notes/ASBL100/L07-genetics-heredity-2.pdf",
"/notes/ASBL100/L08-genetics-heredity-3.pdf",
"/notes/ASBL100/L09-carbohydrates.pdf",
"/notes/ASBL100/L10-proteins-1.pdf",
"/notes/ASBL100/L11-proteins-2.pdf",
"/notes/ASBL100/L12-proteins-3.pdf",
"/notes/ASBL100/L13-membrane-1.pdf",
"/notes/ASBL100/L14-membrane-2.pdf",
"/notes/ASBL100/L15-membrane-transport.pdf",
"/notes/ASBL100/L16-replication.pdf",
"/notes/ASBL100/L17-transcription-translation.pdf",
"/notes/ASBL100/L18-cells.pdf",
"/notes/ASBL100/L19-akp.pdf",
"/notes/ASBL100/L20-cell-cycle.pdf",
"/notes/ASBL100/L21-cell-division.pdf",
"/notes/ASBL100/L22-stem-cells.pdf",
"/notes/ASBL100/sample-paper.pdf"
];
// </offline-manifest>

const SHELL_CACHE = `linkeen-shell-${VERSION}`;
const SLIDE_CACHE = "linkeen-slides";
const FONT_CACHE = "linkeen-fonts";
const NAV_TIMEOUT = 3000;

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const shell = await caches.open(SHELL_CACHE);
    // cache: "reload" skips the HTTP cache so a new version gets fresh files.
    await Promise.all(SHELL.map((u) => shell.add(new Request(u, { cache: "reload" })).catch(() => {})));
    await cacheFonts();
    await self.skipWaiting();
  })());
});

// Font stylesheets name their font files inside; save both.
async function cacheFonts() {
  const cache = await caches.open(FONT_CACHE);
  await Promise.all(FONTS.map(async (u) => {
    try {
      const res = await fetch(u);
      if (!res.ok) return;
      await cache.put(u, res.clone());
      const css = await res.text();
      const files = [...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/g)].map((m) => m[1]);
      await Promise.all(files.map((f) => cache.match(f).then((hit) => hit || cache.add(f)).catch(() => {})));
    } catch (e) { /* offline during install: fonts fall back to system ones */ }
  }));
}

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith("linkeen-shell-") && key !== SHELL_CACHE) await caches.delete(key);
    }
    // Drop slides that were removed from the site.
    const slides = await caches.open(SLIDE_CACHE);
    const keep = new Set(SLIDES);
    for (const req of await slides.keys()) {
      if (SLIDES.length && !keep.has(new URL(req.url).pathname)) await slides.delete(req);
    }
    await self.clients.claim();
  })());
});

// offline.js asks which slides exist, and says "save" on every visit.
// waitUntil keeps the worker alive while it downloads.
self.addEventListener("message", (event) => {
  if (event.data === "slides?") event.source.postMessage({ type: "slides", slides: SLIDES, version: VERSION });
  if (event.data === "save") event.waitUntil(saveSlides());
});

let saving = null;
function saveSlides() {
  if (saving) return saving;
  saving = (async () => {
    const cache = await caches.open(SLIDE_CACHE);
    const have = new Set((await cache.keys()).map((r) => new URL(r.url).pathname));
    const todo = SLIDES.filter((s) => !have.has(s));
    let saved = SLIDES.length - todo.length;
    const tell = async (busy) => {
      for (const c of await self.clients.matchAll({ includeUncontrolled: true })) c.postMessage({ type: "progress", total: SLIDES.length, saved, saving: busy });
    };
    await tell(todo.length > 0);
    const worker = async () => {
      while (todo.length) {
        const s = todo.shift();
        try { await cache.add(s); saved++; } catch (e) { /* lost connection: next visit resumes */ }
        await tell(true);
      }
    };
    await Promise.all([worker(), worker(), worker()]);
    await tell(false);
  })().finally(() => { saving = null; });
  return saving;
}

function cleanPath(url) {
  let p = url.pathname;
  if (p.endsWith(".html")) p = p.slice(0, -5);
  if (p === "/index") p = "/";
  return p;
}

async function fromShell(path) {
  return (await caches.match(path, { ignoreSearch: true })) || null;
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (url.origin === location.origin) {
    if (url.pathname.startsWith("/api/")) return;
    if (url.pathname.startsWith("/notes/") && url.pathname.endsWith(".pdf")) return event.respondWith(slide(url));
    if (req.mode === "navigate") return event.respondWith(page(req, url));
    return event.respondWith(asset(req, url));
  }
  if (/^(fonts\.googleapis\.com|fonts\.gstatic\.com|cdnjs\.cloudflare\.com)$/.test(url.hostname)) {
    return event.respondWith(cacheFirst(req, FONT_CACHE));
  }
});

async function slide(url) {
  const cache = await caches.open(SLIDE_CACHE);
  const key = url.origin + url.pathname;
  const hit = await cache.match(key);
  if (hit) return hit;
  // Fetch the whole file (no Range header) so it can be stored.
  try {
    const res = await fetch(key);
    if (res.ok && res.status === 200) cache.put(key, res.clone());
    return res;
  } catch (e) {
    // Offline and this deck never finished saving: say so, not ERR_FAILED.
    return new Response(
      `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Not saved yet</title>` +
      `<body style="font:16px/1.5 system-ui,sans-serif;max-width:32rem;margin:15vh auto;padding:0 20px;color:#222;background:#f6f1e7">` +
      `<h2 style="margin:0 0 8px">This deck isn't saved yet</h2>` +
      `<p>You're offline and <b>${url.pathname.split("/").pop()}</b> hadn't finished downloading. ` +
      `Open linkeen once on wifi and leave it a minute; every deck saves itself.</p><p><a href="/exams">Back to exams</a></p>`,
      { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
}

async function page(req, url) {
  const path = cleanPath(url);
  const net = fetch(req).then(async (res) => {
    if (res.ok && !res.redirected) (await caches.open(SHELL_CACHE)).put(path, res.clone());
    return res;
  });
  const timeout = new Promise((r) => setTimeout(() => r(null), NAV_TIMEOUT));
  try {
    const first = await Promise.race([net, timeout]);
    if (first) return first;
    const saved = await fromShell(path);
    return saved || (await net);
  } catch (e) {
    return (await fromShell(path)) || (await fromShell("/")) ||
      new Response("<h1>Offline</h1><p>This page hasn't been saved yet. Open linkeen once with wifi.</p>", { headers: { "Content-Type": "text/html" } });
  }
}

// Exact URL first, so a ?v= bump always gets the new file. Only offline does
// "styles.css?v=20" fall back to whatever styles.css was saved.
async function asset(req, url) {
  const cache = await caches.open(SHELL_CACHE);
  const exact = await cache.match(req);
  if (exact) return exact;
  try {
    const res = await fetch(req);
    if (res.ok && res.status === 200) cache.put(req, res.clone());
    return res;
  } catch (e) {
    return (await cache.match(url.pathname, { ignoreSearch: true })) || new Response("", { status: 504 });
  }
}

async function cacheFirst(req, name) {
  const cache = await caches.open(name);
  const hit = await cache.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res.ok || res.type === "opaque") cache.put(req, res.clone());
    return res;
  } catch (e) {
    return new Response("", { status: 504 });
  }
}
