// ============================================================
// national-day.js — UAE National Day (2 Dec).
//
// 1–6 Dec 2026 (or any day with ?nd=1; ?nd=0 turns it off): flag ribbon
// along the top, a waving flag beside the title, a small countdown pill,
// and the flag's four colours as a stripe on the live class card.
// Links, timetable and cards are untouched.
// ============================================================

(function () {
  const START = new Date(2026, 11, 1, 0, 0);
  const END = new Date(2026, 11, 7, 0, 0);   // exclusive: through 6 Dec
  const DAY = new Date(2026, 11, 2);
  const q = new URLSearchParams(location.search).get("nd");
  const now = new Date();
  if (q === "0" || (q !== "1" && (now < START || now >= END))) return;

  document.documentElement.classList.add("national-day");

  const css = `
    html.national-day body::before {
      content: ""; position: fixed; inset: 0 0 auto 0; height: 9px; z-index: 50; pointer-events: none;
      background:
        linear-gradient(100deg, transparent 40%, rgba(255,255,255,.55) 50%, transparent 60%) 0 0 / 250% 100% no-repeat,
        linear-gradient(90deg, #e4002b 0 90px, transparent 90px),
        linear-gradient(#00a651 0 3px, #ffffff 3px 6px, #000 6px 9px);
      animation: nd-shine 4s linear infinite;
    }
    @keyframes nd-shine { from { background-position: 150% 0, 0 0, 0 0; } to { background-position: -150% 0, 0 0, 0 0; } }
    .nd-flag { display: inline-block; width: 34px; height: 22px; margin-left: 12px; vertical-align: -1px;
      transform-origin: left center; animation: nd-wave 2.6s ease-in-out infinite; border-radius: 3px;
      box-shadow: 0 0 0 1px rgba(127,127,127,.3), 0 4px 14px rgba(228,0,43,.35); }
    @keyframes nd-wave { 0%,100% { transform: skewY(0deg) scaleX(1); } 50% { transform: skewY(-4deg) scaleX(.92); } }
    html.national-day .hero h1 { background: linear-gradient(90deg, var(--text) 0 55%, #e4002b 70%, #00a651 85%, var(--text));
      background-size: 300% 100%; -webkit-background-clip: text; background-clip: text; color: transparent;
      animation: nd-title 7s ease-in-out infinite; }
    html.national-day .hero h1 .nd-flag { -webkit-text-fill-color: initial; }
    @keyframes nd-title { 0%,100% { background-position: 0 0; } 50% { background-position: 100% 0; } }
    .nd-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 8px; }
    .nd-pill { position: relative; display: inline-block; padding: 5px 12px; border-radius: 999px; font-size: .8rem; font-weight: 700;
      color: var(--text); background: var(--surface-elevated); isolation: isolate; }
    .nd-pill::before { content: ""; position: absolute; inset: -2px; border-radius: inherit; z-index: -1;
      background: conic-gradient(from var(--nd-a, 0deg), #e4002b, #00a651, #ffffff, #111, #e4002b);
      animation: nd-spin 4s linear infinite; }
    .nd-pill::after { content: ""; position: absolute; inset: 0; border-radius: inherit; z-index: -1; background: var(--surface-elevated); }
    @property --nd-a { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
    @keyframes nd-spin { to { --nd-a: 360deg; } }
    .nd-pill b { color: #e4002b; }
    :root[data-theme="dark"] .nd-pill b { color: #ff4d6a; }
    .nd-play { padding: 6px 14px; border-radius: 999px; border: 0; cursor: pointer; font: 700 .8rem var(--font-sans);
      color: #fff; background: linear-gradient(90deg, #e4002b, #ff5a3c); box-shadow: 0 4px 16px rgba(228,0,43,.4);
      animation: nd-bob 2.4s ease-in-out infinite; }
    .nd-play:hover { filter: brightness(1.1); }
    @keyframes nd-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
    html.national-day .live-tracker-bar { position: relative; overflow: hidden; }
    html.national-day .live-tracker-bar::before { content: ""; position: absolute; inset: 0 0 auto 0; height: 4px;
      background: linear-gradient(90deg, #e4002b 0 18%, #00a651 18% 45%, #ffffff 45% 72%, #000 72%); }
    .nd-fx { position: fixed; inset: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 40; }
    @media (prefers-reduced-motion: reduce) {
      .nd-flag, .nd-play, .nd-pill::before, html.national-day .hero h1, html.national-day body::before { animation: none; }
    }
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  const FLAG = '<svg class="nd-flag" viewBox="0 0 12 6" aria-hidden="true" preserveAspectRatio="none">' +
    '<rect width="12" height="2" y="0" fill="#00a651"/><rect width="12" height="2" y="2" fill="#fff"/>' +
    '<rect width="12" height="2" y="4" fill="#000"/><rect width="3" height="6" fill="#e4002b"/></svg>';

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((DAY - today) / 864e5);
  const text = days > 0 ? `National Day in <b>${days} day${days === 1 ? "" : "s"}</b> · 2 Dec`
    : days === 0 ? "<b>Happy National Day</b> · 55 years of the UAE"
    : "<b>UAE National Day</b> · 55 years";

  function playGame() {
    if (window.ndGame) return window.ndGame.open();
    const sc = document.createElement("script");
    sc.src = "nd-game.js?v=4"; sc.onload = () => window.ndGame && window.ndGame.open();
    document.head.appendChild(sc);
  }

  // one celebratory volley over the page, once per browser session
  function volley() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try { if (sessionStorage.getItem("nd-volley") && q !== "1") return; sessionStorage.setItem("nd-volley", "1"); } catch (e) {}
    const cv = document.createElement("canvas"); cv.className = "nd-fx"; document.body.appendChild(cv);
    const dpr = Math.min(devicePixelRatio || 1, 2), W = innerWidth, H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; const c = cv.getContext("2d"); c.scale(dpr, dpr);
    const COL = ["#e4002b", "#00a651", "#ffffff", "#ffd34d"], sp = [];
    const boom = (x, y) => { for (let i = 0; i < 60; i++) { const a = Math.random() * 6.283, v = 60 + Math.random() * 150;
      sp.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: 1, c: COL[i % 4] }); } };
    [[.2, .22, 0], [.75, .18, 350], [.5, .3, 700], [.35, .15, 1050], [.65, .28, 1350]]
      .forEach(([x, y, t]) => setTimeout(() => boom(W * x, H * y), t));
    let last = performance.now(); const t0 = last;
    (function f(now) {
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      c.clearRect(0, 0, W, H); c.globalCompositeOperation = "lighter";
      for (const p of sp) { p.vy += 80 * dt; p.vx *= .98; p.x += p.vx * dt; p.y += p.vy * dt; p.l -= dt * .7;
        if (p.l > 0) { c.globalAlpha = p.l; c.fillStyle = p.c; c.fillRect(p.x - 1.5, p.y - 1.5, 3, 3); } }
      if (now - t0 < 3600) requestAnimationFrame(f); else cv.remove();
    })(last);
  }

  window.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      const h = document.querySelector(".hero h1, .hero-text h1");
      if (h && !h.querySelector(".nd-flag")) h.insertAdjacentHTML("beforeend", FLAG);
      const box = document.querySelector(".hero-text");
      if (box && !box.querySelector(".nd-row")) {
        box.insertAdjacentHTML("beforeend", `<div class="nd-row"><span class="nd-pill">${text}</span><button type="button" class="nd-play">🎆 Play Fireworks Rush</button></div>`);
        box.querySelector(".nd-play").addEventListener("click", playGame);
      }
      volley();
    }, 0);
  });
})();
