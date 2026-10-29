// ============================================================
// exams-over.js — "mid-sems are over" card + confetti (exams.html only)
//
// Switches itself on once the last paper in EXAMS (exams.js) has finished,
// i.e. two hours after its start time. Confetti uses the five paper colours.
// Bursts once per tab; the card's button fires it again. Remove or re-date
// before end-sems, or it will happily congratulate you a week early.
// ============================================================

(function () {
  if (typeof EXAMS === "undefined" || !EXAMS.length) return;
  const last = EXAMS[EXAMS.length - 1];
  const end = new Date(`${last.date}T${last.start}:00`).getTime() + 2 * 3600e3;
  const force = /[?&]over=1/.test(location.search);
  if (Date.now() < end && !force) return;

  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const colors = EXAMS.map((ex) => (typeof COURSE_COLORS !== "undefined" && COURSE_COLORS[ex.code]) || "#4a9c3f");

  // Count ticks across every paper, for the stats line.
  let ticked = 0, total = 0;
  EXAMS.forEach((ex) => ex.topics.forEach((tp) => {
    total++;
    if (localStorage.getItem(`exams:${ex.code}:${typeof tp === "string" ? tp : tp.t}`) === "1") ticked++;
  }));

  const LINES = [
    "Sleep schedule: technically still exists.",
    "Grades come later. That is a problem for future you.",
    "The slides will not miss you. You will not miss them.",
    "You may now open YouTube without guilt.",
    "Your brain has been returned to factory settings.",
    "Nobody asks about mid-sems in job interviews. Probably."
  ];
  const line = LINES[Math.floor(Math.random() * LINES.length)];

  const css = `
    .eo-card {
      position: relative; overflow: hidden; margin: 0 0 14px; padding: 18px 18px 16px;
      border-radius: 16px; background: var(--surface-elevated); border: 1px solid var(--border-soft);
      animation: eo-rise .7s cubic-bezier(.2,.9,.3,1.2) both;
    }
    .eo-kicker { font-size: .74rem; letter-spacing: .14em; text-transform: uppercase; color: var(--text-subtle); }
    .eo-title { font-family: var(--font-serif); font-weight: 500; font-size: 2.1rem; line-height: 1.05; margin: 4px 0 2px; color: var(--text); }
    .eo-title em { font-family: 'Caveat', cursive; font-style: normal; color: var(--accent); font-size: 1.15em; }
    .eo-line { margin: 6px 0 12px; color: var(--text-muted); font-size: .95rem; }
    .eo-papers { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
    .eo-paper {
      font-size: .78rem; font-weight: 600; padding: 3px 10px; border-radius: 999px;
      color: var(--c); border: 1px solid var(--c); background: var(--surface);
      animation: eo-pop .45s cubic-bezier(.3,1.6,.5,1) both;
    }
    .eo-paper s { text-decoration-thickness: 2px; }
    .eo-foot { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 14px; font-size: .84rem; color: var(--text-muted); }
    .eo-foot b { color: var(--text); }
    .eo-btn {
      margin-left: auto; padding: 6px 14px; border-radius: 999px; cursor: pointer;
      font: inherit; font-size: .85rem; font-weight: 600; color: var(--surface);
      background: var(--accent); border: 0; transition: transform .12s ease;
    }
    .eo-btn:active { transform: scale(.94); }
    .eo-stamp {
      position: absolute; top: 14px; right: 14px; padding: 4px 12px;
      font: 700 1.05rem/1 'Inter', sans-serif; letter-spacing: .12em; color: #c2410c;
      border: 3px solid #c2410c; border-radius: 8px; transform: rotate(-12deg);
      opacity: .85; mix-blend-mode: multiply; pointer-events: none;
      animation: eo-stamp .5s .9s cubic-bezier(.5,0,.6,1.4) both;
    }
    [data-theme="dark"] .eo-stamp { mix-blend-mode: normal; color: #fb923c; border-color: #fb923c; }
    @keyframes eo-rise { from { opacity: 0; transform: translateY(14px) scale(.98); } }
    @keyframes eo-pop { from { opacity: 0; transform: scale(.4); } }
    @keyframes eo-stamp { from { opacity: 0; transform: rotate(-30deg) scale(3); } }
    .eo-canvas { position: fixed; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 9998; }
    @media (max-width: 560px) {
      .eo-title { font-size: 1.6rem; padding-right: 92px; }
      .eo-stamp { font-size: .85rem; top: 12px; right: 10px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .eo-card, .eo-paper, .eo-stamp { animation: none; }
    }`;

  function confetti() {
    if (reduce) return;
    const c = document.createElement("canvas");
    c.className = "eo-canvas";
    document.body.appendChild(c);
    const ctx = c.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = c.width = innerWidth * dpr, H = c.height = innerHeight * dpr;
    // Two cannons from the bottom corners, aimed up and inwards.
    const bits = [];
    for (let i = 0; i < 160; i++) {
      const left = i % 2 === 0;
      const ang = (left ? -60 : -120) * Math.PI / 180 + (Math.random() - .5) * .8;
      const sp = (14 + Math.random() * 12) * dpr;
      bits.push({
        x: left ? 0 : W, y: H,
        vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
        w: (6 + Math.random() * 6) * dpr, h: (3 + Math.random() * 4) * dpr,
        r: Math.random() * 6, vr: (Math.random() - .5) * .4,
        flip: Math.random() * 6, color: colors[i % colors.length]
      });
    }
    const t0 = performance.now();
    (function frame(t) {
      const age = t - t0;
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = Math.max(0, 1 - Math.max(0, age - 2600) / 900);
      for (const b of bits) {
        b.vy += .35 * dpr; b.vx *= .985; b.vy *= .985;
        b.x += b.vx; b.y += b.vy; b.r += b.vr; b.flip += .2;
        ctx.save();
        ctx.translate(b.x, b.y); ctx.rotate(b.r); ctx.scale(1, Math.cos(b.flip));
        ctx.fillStyle = b.color;
        ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
        ctx.restore();
      }
      if (age < 3500) requestAnimationFrame(frame); else c.remove();
    })(t0);
  }

  function mount() {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    const h1 = document.querySelector(".ex-intro h1");
    if (h1) h1.innerHTML = `Mid-sem portions <em>(retired)</em>`;

    const days = Math.round((new Date(last.date) - new Date(EXAMS[0].date)) / 864e5) + 1;
    const card = document.createElement("section");
    card.className = "eo-card";
    card.innerHTML = `
      <div class="eo-stamp">SURVIVED</div>
      <div class="eo-kicker">Mid-sems · ${days} days · ${EXAMS.length} papers</div>
      <h2 class="eo-title">It's over. <em>Go outside.</em></h2>
      <p class="eo-line">${line}</p>
      <div class="eo-papers">${EXAMS.map((ex, i) =>
        `<span class="eo-paper" style="--c:${colors[i]};animation-delay:${.25 + i * .12}s"><s>${ex.code}</s> ✓</span>`).join("")}</div>
      <div class="eo-foot">
        <span>${ticked ? `<b>${ticked}</b> of ${total} topics ticked. The rest were vibes.` : `${total} topics. Ticked: none. Respect.`}</span>
        <button type="button" class="eo-btn">Celebrate again 🎉</button>
      </div>`;
    const anchor = document.querySelector(".ss-box");
    anchor.parentNode.insertBefore(card, anchor);
    card.querySelector(".eo-btn").addEventListener("click", confetti);

    if (!sessionStorage.getItem("exams-over-burst")) {
      sessionStorage.setItem("exams-over-burst", "1");
      setTimeout(confetti, 350);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
