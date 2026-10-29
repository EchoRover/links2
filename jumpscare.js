// ============================================================
// jumpscare.js — the thing in the horror skin that actually comes for you.
//
// Runs only while exam-mode.js has the horror skin on (html.exam-mode).
// One of the horror photos lunges at the screen, silently: people open the
// site in class. Ways it finds you:
//   stare   sit still on the page long enough and the room goes dark;
//           move during the dark and it notices you sooner
//   return  leave the tab 5 s+; usually it's waiting when you come back
//   dark    the theme button's blackout (exam-mode.js), every time
//   summon  click the avatar or the hero title
//   load    every page load or refresh, 1.5-3 s in
//
// Budget: at most 15 a day, at least 1 minute apart, never in the first 6 s.
// The avatar (or the hero title) summons one on demand, no budget.
// Skipped entirely for prefers-reduced-motion. No strobing: one cut to the
// face, then motion, then black.
//
//   ?boo=1  fire one in 3 s (ignores the budget)    ?boo=0  never again on this device
// ============================================================

(function () {
  const root = document.documentElement;
  if (!root.classList.contains("exam-mode")) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const params = new URLSearchParams(location.search);
  function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function save(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  if (params.get("boo") === "0") save("boo-off", "1");
  if (params.get("boo") === "1") save("boo-off", "");
  if (load("boo-off") === "1") return;

  const MAX_PER_DAY = 15;
  const GAP_MS = 60 * 1000;
  const loadedAt = Date.now();
  const rand = (a, b) => a + Math.random() * (b - a);

  function log() {
    try { return JSON.parse(load("boo-log") || "[]").filter((t) => Date.now() - t < 864e5); } catch (e) { return []; }
  }
  function allowed() {
    const l = log();
    if (Date.now() - loadedAt < 6000) return false;
    if (l.length >= MAX_PER_DAY) return false;
    return !l.length || Date.now() - l[l.length - 1] > GAP_MS;
  }

  // ---------- the face ----------
  const FACE =
    '<svg viewBox="0 0 400 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
    '<defs>' +
    '<radialGradient id="js-skin" cx="50%" cy="38%" r="62%">' +
    '<stop offset="0" stop-color="#e4e2d6"/><stop offset=".55" stop-color="#9c9d8f"/><stop offset="1" stop-color="#1d1e19"/></radialGradient>' +
    '<radialGradient id="js-sock" cx="50%" cy="45%" r="55%">' +
    '<stop offset=".35" stop-color="#000"/><stop offset=".8" stop-color="#1b0c0c"/><stop offset="1" stop-color="#5d4d48" stop-opacity="0"/></radialGradient>' +
    '<filter id="js-grain"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7" result="n"/>' +
    '<feColorMatrix in="n" values=".5 0 0 0 .5  .5 0 0 0 .5  .5 0 0 0 .5  0 0 0 0 1" result="g"/>' +
    '<feBlend in="SourceGraphic" in2="g" mode="multiply" result="b"/>' +
    '<feComposite in="b" in2="SourceGraphic" operator="in"/></filter>' +
    '<filter id="js-soft"><feGaussianBlur stdDeviation="2.2"/></filter>' +
    '</defs>' +
    '<rect width="400" height="520" fill="#000"/>' +
    '<g filter="url(#js-grain)">' +
    // skull-tight head, too long at the jaw
    '<path d="M200 18c92 0 150 70 152 170 2 88-24 150-58 216-24 46-56 104-94 104s-70-58-94-104C72 338 46 276 48 188 50 88 108 18 200 18z" fill="url(#js-skin)"/>' +
    // hollow temples and cheeks
    '<path d="M70 210c18 60 44 100 70 122M330 210c-18 60-44 100-70 122" stroke="#2a2a24" stroke-width="26" fill="none" opacity=".35" filter="url(#js-soft)"/>' +
    // sockets
    '<ellipse cx="135" cy="210" rx="56" ry="62" fill="url(#js-sock)"/>' +
    '<ellipse cx="265" cy="210" rx="56" ry="62" fill="url(#js-sock)"/>' +
    '<ellipse cx="137" cy="214" rx="34" ry="40" fill="#000"/><ellipse cx="263" cy="214" rx="34" ry="40" fill="#000"/>' +
    // pinprick pupils, slightly off, looking straight at you
    '<circle cx="141" cy="210" r="4.2" fill="#fff"/><circle cx="259" cy="212" r="4.2" fill="#fff"/>' +
    '<circle cx="141" cy="210" r="11" fill="#fff" opacity=".12"/><circle cx="259" cy="212" r="11" fill="#fff" opacity=".12"/>' +
    // nose: two slits
    '<path d="M188 288c-4 12-4 22 0 28M212 288c4 12 4 22 0 28" stroke="#111" stroke-width="7" stroke-linecap="round" fill="none"/>' +
    // the mouth, stretched far too long
    '<path d="M150 352c14-8 86-8 100 0 12 40 6 116-50 150-56-34-62-110-50-150z" fill="#000"/>' +
    '<path d="M154 356l10 16 9-14 10 18 9-17 8 18 9-18 9 17 10-18 9 14 10-16" fill="#d9d4c2"/>' +
    '<path d="M168 470l9-14 8 12 8-14 7 13 8-13 8 14 8-12 9 14" fill="#bdb6a2" opacity=".85"/>' +
    // a crack running from the eye
    '<path d="M110 262c-6 22 2 40-6 62s-2 40-10 58" stroke="#3a0006" stroke-width="3" fill="none"/>' +
    '<path d="M108 262c-4 26 0 44-8 66" stroke="#7a0010" stroke-width="5" fill="none" opacity=".7"/>' +
    '</g></svg>';

  // Photos (assets/boo, generated in Canva for this site) are preloaded so the
  // cut is instant; the drawn face above is only the fallback if none load.
  const PHOTOS = ["assets/boo/face.jpg", "assets/boo/crawler.jpg", "assets/boo/hag.jpg",
    "assets/boo/job-application.png"];   // the scariest one
  const ready = [];
  PHOTOS.forEach((src) => {
    const img = new Image();
    img.onload = () => ready.push(src);
    img.src = src;
  });
  let lastPick = "";
  function pickVictim() {
    const pool = ready.length > 1 ? ready.filter((p) => p !== lastPick) : ready.length ? ready : ["svg"];
    lastPick = pool[Math.floor(Math.random() * pool.length)];
    return lastPick === "svg" ? FACE : `<img src="${lastPick}" alt="">`;
  }

  let el = null;
  function stage() {
    if (!el) {
      el = document.createElement("div");
      el.className = "js-stage";
      el.innerHTML = '<div class="js-dark"></div><div class="js-face"></div>';
      document.body.appendChild(el);
    }
    el.querySelector(".js-face").innerHTML = pickVictim();
    return el;
  }

  let busy = false;
  function record() { const l = log(); l.push(Date.now()); save("boo-log", JSON.stringify(l)); }

  // kind: "stare" | "return" | "dark" | "test"
  function fire(kind, force) {
    if (busy || (!force && !allowed())) return false;
    busy = true;
    record();
    const s = stage();
    s.className = "js-stage on js-" + kind;
    if (navigator.vibrate) navigator.vibrate([60, 40, 400]);
    // "return": it's already there, still, for a breath before it moves.
    const lungeAt = kind === "return" ? 380 : 0;
    setTimeout(() => s.classList.add("lunge"), lungeAt);
    setTimeout(() => s.classList.add("gone"), lungeAt + 1500);
    setTimeout(() => {
      s.className = "js-stage";
      root.classList.remove("js-dim");
      busy = false;
    }, lungeAt + 2600);
    return true;
  }

  // ---------- trigger: stare ----------
  let idleTimer = null, building = false, buildTimer = null;
  function armStare() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(beginDark, rand(15000, 30000));
  }
  function beginDark() {
    if (document.hidden || busy || !allowed()) return armStare();
    building = true;
    root.classList.add("js-dim");
    buildTimer = setTimeout(() => { building = false; fire("stare"); }, rand(3500, 5500));
  }
  function stirred() {
    if (building) {
      // it saw that.
      building = false;
      clearTimeout(buildTimer);
      setTimeout(() => fire("stare"), 140);
      return;
    }
    if (!busy) armStare();
  }
  ["mousemove", "scroll", "keydown", "pointerdown", "touchstart"].forEach((e) =>
    window.addEventListener(e, stirred, { passive: true }));
  armStare();

  // ---------- trigger: return ----------
  let leftAt = 0;
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { leftAt = Date.now(); return; }
    if (leftAt && Date.now() - leftAt > 5000 && Math.random() < 0.75) fire("return");
    leftAt = 0;
  });

  window.Jumpscare = { fire: (kind) => fire(kind || "dark") };

  // ---------- trigger: summon ----------
  // Poke the avatar or the title and it answers. Always, no budget.
  document.querySelectorAll(".avatar, .hero h1").forEach((t) => {
    t.style.cursor = "pointer";
    t.addEventListener("click", () => setTimeout(() => fire("dark", true), 250));
  });

  // ---------- trigger: load ----------
  // Every page load (refresh included) gets one, a beat after the page looks
  // normal. Skips the budget.
  if (params.get("boo") !== "1") setTimeout(() => fire("load", true), rand(1500, 3000));

  if (params.get("boo") === "1") {
    setTimeout(() => {
      root.classList.add("js-dim");
      setTimeout(() => fire("test", true), 2500);
    }, 3000);
  }
})();
