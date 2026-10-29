// ============================================================
// jumpscare.js — the thing in the horror skin that actually comes for you.
//
// Runs only while exam-mode.js has the horror skin on (html.exam-mode).
// One of three horror photos lunges at the screen with a synthesized
// scream. Ways it finds you:
//   stare   sit still on the page long enough and the room goes dark;
//           move during the dark and it notices you sooner
//   return  leave the tab 5 s+; usually it's waiting when you come back
//   dark    the theme button's blackout (exam-mode.js), every time
//   summon  click the avatar or the hero title
//   load    every page load or refresh: 1.5-3 s in if sound is allowed,
//           otherwise on the first tap/key so the scream plays
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

  // ---------- sound: needs one tap or key first, browsers insist ----------
  let ctx = null;
  function unlock() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    if (ctx && ctx.state === "suspended") ctx.resume();
  }
  ["pointerdown", "keydown", "touchstart"].forEach((e) => window.addEventListener(e, unlock, { passive: true }));

  function noise(seconds) {
    const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    return src;
  }

  function crush() {
    const ws = ctx.createWaveShaper();
    const c = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; c[i] = Math.tanh(x * 6); }
    ws.curve = c;
    return ws;
  }

  // A low hum that swells while the room darkens.
  let drone = null;
  function droneOn() {
    if (!ctx || ctx.state !== "running" || drone) return;
    const t = ctx.currentTime;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.18, t + 4);
    g.connect(ctx.destination);
    const oscs = [41, 43.5, 82].map((f) => {
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = f;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 220;
      o.connect(lp).connect(g);
      o.start();
      return o;
    });
    drone = { g, oscs };
  }
  function droneOff() {
    if (!drone) return;
    const t = ctx.currentTime;
    drone.g.gain.cancelScheduledValues(t);
    drone.g.gain.setValueAtTime(0, t);
    drone.oscs.forEach((o) => o.stop(t + 0.05));
    drone = null;
  }

  // The scream: detuned saws sliding up through a distortion, a shriek band of
  // noise on top, and a low slam underneath.
  function scream() {
    if (!ctx) return;
    // resume() from the tap may still be settling; scream as soon as it lands.
    if (ctx.state !== "running") { ctx.resume().then(() => { if (ctx.state === "running") scream(); }); return; }
    const t = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, t);
    master.gain.exponentialRampToValueAtTime(0.75, t + 0.02);
    master.gain.setValueAtTime(0.75, t + 0.9);
    master.gain.exponentialRampToValueAtTime(0.0001, t + 1.7);
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);

    const dist = crush();
    const voice = ctx.createGain();
    voice.gain.value = 0.35;
    dist.connect(voice).connect(master);
    [520, 547, 780, 1103].forEach((f) => {
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(f * 0.6, t);
      o.frequency.exponentialRampToValueAtTime(f * 1.25, t + 0.25);
      o.frequency.exponentialRampToValueAtTime(f * 0.9, t + 1.6);
      const lfo = ctx.createOscillator();
      const lg = ctx.createGain();
      lfo.frequency.value = rand(11, 17);
      lg.gain.value = f * 0.04;
      lfo.connect(lg).connect(o.frequency);
      o.connect(dist);
      o.start(t); lfo.start(t);
      o.stop(t + 1.8); lfo.stop(t + 1.8);
    });

    const n = noise(1.8);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 3;
    bp.frequency.setValueAtTime(1600, t);
    bp.frequency.exponentialRampToValueAtTime(3400, t + 0.3);
    const ng = ctx.createGain();
    ng.gain.value = 0.9;
    n.connect(bp).connect(ng).connect(master);
    n.start(t);

    const slam = ctx.createOscillator();
    const sg = ctx.createGain();
    slam.frequency.setValueAtTime(110, t);
    slam.frequency.exponentialRampToValueAtTime(30, t + 0.4);
    sg.gain.setValueAtTime(1, t);
    sg.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    slam.connect(sg).connect(master);
    slam.start(t); slam.stop(t + 0.5);
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
    droneOff();
    if (navigator.vibrate) navigator.vibrate([60, 40, 400]);
    // "return": it's already there, still, for a breath before it moves.
    const lungeAt = kind === "return" ? 380 : 0;
    setTimeout(() => {
      s.classList.add("lunge");
      scream();
    }, lungeAt);
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
    droneOn();
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
    t.addEventListener("click", () => { unlock(); setTimeout(() => fire("dark", true), 250); });
  });

  // ---------- trigger: load ----------
  // Every page load (refresh included) gets one, a beat after the page looks
  // normal. Skips the budget. Sound only if the browser lets audio start
  // without a tap (Chrome does for sites you use a lot); otherwise silent.
  // If the browser holds audio back until a tap (most do on a fresh load),
  // the scare waits for that first tap or key instead, so it comes with the
  // scream. A tapped link still opens, once the scare is over.
  if (params.get("boo") !== "1") {
    unlock();
    let done = false;
    const onFirst = (e) => {
      if (done) return;
      done = true;
      unlock();
      fire("load", true);
      const a = e.target.closest && e.target.closest("a[href]");
      if (a && a.target !== "_blank") {
        const href = a.href;
        const stop = (ev) => { ev.preventDefault(); ev.stopPropagation(); };
        a.addEventListener("click", stop, { capture: true, once: true });
        setTimeout(() => { location.href = href; }, 2700);
      }
    };
    setTimeout(() => {
      if (done) return;
      if (ctx && ctx.state === "running") { done = true; fire("load", true); return; }
      ["pointerdown", "touchend", "keydown"].forEach((ev) =>
        window.addEventListener(ev, onFirst, { capture: true }));
    }, rand(1500, 3000));
  }

  if (params.get("boo") === "1") {
    setTimeout(() => {
      root.classList.add("js-dim");
      droneOn();
      setTimeout(() => fire("test", true), 2500);
    }, 3000);
  }
})();
