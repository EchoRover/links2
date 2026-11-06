// ============================================================
// diwali.js — Deepawali week skin (index only). Took over from Flag Day.
//
// 6-10 Nov 2026 (or any day with ?diwali=1; ?diwali=0 turns it off):
//   - a string of warm lights along the top edge
//   - a diya beside the heading, greeting in the eyebrow line
//   - "light the diyas" card: tap all seven, the sky answers with fireworks
//   - tap any empty bit of the page for a small phuljhadi spark
// Links, timetable and cards are untouched.
// ============================================================

(function () {
  const START = new Date(2026, 10, 6, 0, 0);
  const END = new Date(2026, 10, 11, 0, 0);   // exclusive: through 10 Nov
  const params = new URLSearchParams(location.search);
  const q = params.get("diwali");
  const now = new Date();
  if (q === "0" || (q !== "1" && (now < START || now >= END))) return;
  if (params.get("scary") === "1" && q !== "1") return;   // archived Halloween link stays pure Halloween

  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("diwali");

  const css = `
    .dw-lights { position: fixed; inset: 0 0 auto 0; height: 18px; z-index: 50; pointer-events: none; }
    .dw-lights svg { width: 100%; height: 100%; display: block; overflow: visible; }
    .dw-bulb { animation: dw-twinkle 2.4s ease-in-out infinite; }
    @keyframes dw-twinkle { 0%,100% { opacity: 1; } 50% { opacity: .45; } }
    .dw-diya { display: inline-block; width: 30px; height: 26px; margin-left: 10px; vertical-align: -3px; }
    .dw-flame { transform-origin: 12px 11px; animation: dw-flick 1.1s ease-in-out infinite alternate; }
    @keyframes dw-flick { from { transform: scale(1, 1) rotate(-3deg); } to { transform: scale(.88, 1.08) rotate(3deg); } }

    .dw-card { margin: 0 0 14px; padding: 11px 14px 12px; border-radius: 12px;
      background: linear-gradient(160deg, #2a1a12, #3b2215); color: #f6e7cf;
      border: 1px solid #5a3a22; font: 400 13px/1.4 var(--font-sans, Inter, system-ui, sans-serif); }
    .dw-head { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; margin-bottom: 8px; }
    .dw-title { font: italic 500 15px/1.2 var(--font-serif, Georgia, serif); color: #ffd28a; }
    .dw-count { font-size: 11.5px; color: #d9b98f; font-variant-numeric: tabular-nums; }
    .dw-row { display: flex; justify-content: space-between; gap: 4px; }
    .dw-d { flex: 1; max-width: 44px; aspect-ratio: 1 / .9; border: 0; padding: 0; background: none; cursor: pointer;
      border-radius: 8px; transition: transform .15s ease; -webkit-tap-highlight-color: transparent; }
    .dw-d:hover { transform: translateY(-2px); }
    .dw-d:focus-visible { outline: 2px solid #ffd28a; outline-offset: 2px; }
    .dw-d svg { width: 100%; height: 100%; display: block; overflow: visible; }
    .dw-d .dw-f { opacity: 0; transform: scale(.3); transform-origin: 12px 11px; transition: opacity .25s, transform .35s cubic-bezier(.3,1.6,.5,1); }
    .dw-d.lit .dw-f { opacity: 1; transform: scale(1); }
    .dw-d.lit .dw-f path { animation: dw-flick 1s ease-in-out infinite alternate; transform-origin: 12px 11px; }
    .dw-d.lit .dw-glow { opacity: .55; }
    .dw-glow { opacity: 0; transition: opacity .4s; }
    .dw-msg { margin: 8px 0 0; min-height: 1.4em; color: #e9cfa8; font-size: 12.5px; }
    .dw-again { border: 0; background: none; color: #ffd28a; text-decoration: underline; cursor: pointer; font: inherit; padding: 0; }
    #dw-sky { position: fixed; inset: 0; width: 100%; height: 100%; z-index: 70; pointer-events: none; }
    @media (prefers-reduced-motion: reduce) { .dw-bulb, .dw-flame, .dw-d.lit .dw-f path { animation: none; } }
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  // ---------- pieces ----------
  const DIYA = (flame) => `
    <svg viewBox="0 0 24 21" aria-hidden="true">
      <ellipse class="dw-glow" cx="12" cy="9" rx="9" ry="7" fill="#ffb347" opacity=".35" filter="url(#dw-blur)"/>
      <g class="${flame}"><path d="M12 2.5c2.2 3 2.6 5.4 0 8.3-2.6-2.9-2.2-5.3 0-8.3z" fill="#ffb02e"/>
        <path d="M12 5.5c1.1 1.6 1.2 2.9 0 4.4-1.2-1.5-1.1-2.8 0-4.4z" fill="#fff3c4"/></g>
      <path d="M2 11.5h20c-.8 4.6-4.7 7.5-10 7.5S2.8 16.1 2 11.5z" fill="#c2532d"/>
      <path d="M2 11.5h20c-.2 1-.6 1.9-1.1 2.7H3.1c-.5-.8-.9-1.7-1.1-2.7z" fill="#e07a3f"/>
      <path d="M6 15.2h12" stroke="#ffd28a" stroke-width=".8" stroke-dasharray="1 1.4" opacity=".8"/>
    </svg>`;
  const DEFS = `<svg width="0" height="0" style="position:absolute"><defs>
      <filter id="dw-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6"/></filter></defs></svg>`;

  function lights() {
    const w = window.innerWidth, step = w < 600 ? 34 : 44, n = Math.ceil(w / step) + 1;
    const cols = ["#ffcf6b", "#ff8a5c", "#ffe9a8", "#f7a531"];
    let wire = `M0 2`, bulbs = "";
    for (let i = 0; i < n; i++) {
      const x = i * step, mid = x + step / 2;
      wire += ` Q${mid} 9 ${x + step} 2`;
      const c = cols[i % cols.length];
      bulbs += `<g class="dw-bulb" style="animation-delay:${(i % 5) * -0.45}s">
        <circle cx="${mid}" cy="9.5" r="5" fill="${c}" opacity=".25"/>
        <circle cx="${mid}" cy="9.5" r="2.4" fill="${c}"/></g>`;
    }
    return `<svg viewBox="0 0 ${w} 18" preserveAspectRatio="none"><path d="${wire}" stroke="#7a5a3a" stroke-width="1" fill="none" opacity=".7"/>${bulbs}</svg>`;
  }

  // ---------- particles (fireworks + sparks), one shared canvas ----------
  let sky, ctx, parts = [], running = false;
  function ensureSky() {
    if (sky) return;
    sky = document.createElement("canvas");
    sky.id = "dw-sky";
    sky.setAttribute("aria-hidden", "true");
    document.body.appendChild(sky);
    ctx = sky.getContext("2d");
    const fit = () => { const r = devicePixelRatio || 1; sky.width = innerWidth * r; sky.height = innerHeight * r; ctx.setTransform(r, 0, 0, r, 0, 0); };
    fit(); addEventListener("resize", fit);
  }
  function burst(x, y, count, speed, hues, life) {
    ensureSky();
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, v = speed * (0.35 + Math.random() * 0.65);
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life, max: life,
        hue: hues[(Math.random() * hues.length) | 0], size: 1 + Math.random() * 1.6 });
    }
    if (!running) { running = true; requestAnimationFrame(tick); }
  }
  function tick() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    // normal blending: "lighter" washes out to white on the cream light theme
    parts = parts.filter((p) => p.life > 0);
    for (const p of parts) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.045; p.vx *= 0.985; p.vy *= 0.985; p.life--;
      const t = p.life / p.max;
      ctx.fillStyle = `hsla(${p.hue}, 92%, ${48 + 14 * t}%, ${Math.min(1, t * 1.4)})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (0.6 + t), 0, 6.283); ctx.fill();
    }
    if (parts.length) requestAnimationFrame(tick);
    else { running = false; ctx.clearRect(0, 0, innerWidth, innerHeight); }
  }
  function fireworks() {
    if (calm) return;
    const sets = [[38, 48], [8, 30], [320, 340], [45, 55, 200], [28, 12]];
    for (let i = 0; i < 9; i++) setTimeout(() => {
      burst(innerWidth * (0.15 + Math.random() * 0.7), innerHeight * (0.12 + Math.random() * 0.35),
        70, 4.2, sets[i % sets.length], 70 + (Math.random() * 25 | 0));
    }, i * 380);
  }

  // ---------- the diya card ----------
  const N = 7;
  const lines = ["", "one diya lit", "two, the street notices", "three, keep going", "four, halfway to bright",
    "five, almost there", "one more", ""];
  function diyaCard() {
    const el = document.createElement("div");
    el.className = "dw-card";
    el.id = "dw-card";
    el.innerHTML = `${DEFS}<div class="dw-head"><span class="dw-title">light the diyas</span><span class="dw-count">0 / ${N}</span></div>
      <div class="dw-row">${Array.from({ length: N }, (_, i) => `<button type="button" class="dw-d" aria-pressed="false" aria-label="Diya ${i + 1}">${DIYA("dw-f")}</button>`).join("")}</div>
      <p class="dw-msg" aria-live="polite">tap each one</p>`;
    const count = el.querySelector(".dw-count"), msg = el.querySelector(".dw-msg");
    const update = () => {
      const lit = el.querySelectorAll(".dw-d.lit").length;
      count.textContent = `${lit} / ${N}`;
      if (lit === N) {
        msg.innerHTML = `shubh deepawali ✦ <button type="button" class="dw-again">again</button>`;
        msg.querySelector(".dw-again").onclick = () => { el.querySelectorAll(".dw-d").forEach((d) => { d.classList.remove("lit"); d.setAttribute("aria-pressed", "false"); }); msg.textContent = "tap each one"; count.textContent = `0 / ${N}`; };
        fireworks();
      } else msg.textContent = lines[lit] || "tap each one";
    };
    el.querySelectorAll(".dw-d").forEach((d) => d.addEventListener("click", (e) => {
      e.stopPropagation();
      if (d.classList.contains("lit")) return;
      d.classList.add("lit"); d.setAttribute("aria-pressed", "true");
      const r = d.getBoundingClientRect();
      if (!calm) burst(r.left + r.width / 2, r.top + r.height * 0.25, 14, 1.8, [38, 45, 28], 32);
      update();
    }));
    return el;
  }
  function placeCard() {
    let el = document.getElementById("dw-card") || diyaCard();
    const ann = document.getElementById("announce");
    const narrow = matchMedia("(max-width: 1024px)").matches;
    const side = document.querySelector(".side-col"), grid = document.querySelector(".body-grid");
    if (ann && ann.parentNode) ann.after(el);
    else if (!narrow && side) side.prepend(el);
    else if (grid) grid.before(el);
  }

  // ---------- phuljhadi: tap empty page ----------
  function sparks(e) {
    if (calm || e.target.closest("a, button, input, select, textarea, label, .modal, .live-tracker-bar, .box, [role=dialog]")) return;
    burst(e.clientX, e.clientY, 22, 2.6, [42, 50, 30, 55], 38);
  }

  window.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      const bar = document.createElement("div");
      bar.className = "dw-lights";
      bar.setAttribute("aria-hidden", "true");
      bar.innerHTML = lights();
      document.body.appendChild(bar);
      let w = innerWidth;
      addEventListener("resize", () => {
        if (Math.abs(innerWidth - w) < 40) return;
        w = innerWidth; bar.innerHTML = lights(); placeCard();
      });

      const d = now.getDate();
      const eyebrow = document.querySelector(".hero-eyebrow");
      if (eyebrow) eyebrow.textContent = q === "1" || d === 8 ? "Year 3 · Happy Deepawali · 8 Nov"
        : d === 9 ? "Year 3 · Deepawali holiday · no classes today"
        : d < 8 ? "Year 3 · Deepawali on Sunday · 8 Nov"
        : "Year 3 · Deepawali week";
      const h = document.querySelector(".hero h1, .hero-text h1");
      if (h && !h.querySelector(".dw-diya")) h.insertAdjacentHTML("beforeend", `<span class="dw-diya">${DEFS}${DIYA("dw-flame")}</span>`);

      placeCard();
      document.addEventListener("click", sparks);
    }, 0);
  });
})();
