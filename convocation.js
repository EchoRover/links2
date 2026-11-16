// ============================================================
// convocation.js — IITD-AD's first Convocation (19 Nov 2026, first M.Tech batch).
//
// On 17–19 Nov 2026 (or any day with ?convo=1; ?convo=0 turns it off): a
// thin gold and crimson hood ribbon along the top, a mortarboard with a
// swinging tassel beside the greeting, the eyebrow line, and once per day a
// cap toss. Tap the cap to toss again. Links, timetable and cards are untouched.
// ============================================================

(function () {
  const START = new Date(2026, 10, 17, 0, 0);
  const END = new Date(2026, 10, 20, 0, 0);   // exclusive: through 19 Nov
  const q = new URLSearchParams(location.search).get("convo");
  const now = new Date();
  if (q === "0" || (q !== "1" && (now < START || now >= END))) return;

  document.documentElement.classList.add("convo");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const css = `
    html.convo body::before {
      content: ""; position: fixed; inset: 0 0 auto 0; height: 6px; z-index: 50; pointer-events: none;
      background: linear-gradient(#c9a227 0 3px, #8c1d2f 3px 6px);
    }
    .cv-cap { display: inline-block; width: 34px; height: 30px; margin-left: 10px; vertical-align: -3px;
      cursor: pointer; overflow: visible; }
    .cv-tassel { transform-origin: 27px 12px; animation: cv-swing 2.8s ease-in-out infinite; }
    @keyframes cv-swing { 0%,100% { transform: rotate(-6deg); } 50% { transform: rotate(9deg); } }
    .cv-fly { position: fixed; z-index: 60; width: 30px; height: 26px; pointer-events: none; left: 0; top: 0; }
    @media (prefers-reduced-motion: reduce) { .cv-tassel { animation: none; } }
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  const capSvg = (cls, tassel) =>
    `<svg class="${cls}" viewBox="0 0 34 30" aria-hidden="true">` +
    `<path d="M9 13v7c0 2.5 4 4.5 8 4.5s8-2 8-4.5v-7" fill="#1f2a24"/>` +
    `<path d="M17 4 33 11 17 18 1 11z" fill="#2b3a31" stroke="#1f2a24" stroke-width=".8"/>` +
    `<circle cx="17" cy="11" r="1.3" fill="#c9a227"/>` +
    `<g class="${tassel ? "cv-tassel" : ""}"><path d="M17 11 27 12v9" stroke="#c9a227" stroke-width="1.1" fill="none"/>` +
    `<path d="M25.6 21h2.8l-.4 5h-2z" fill="#c9a227"/></g></svg>`;

  // A handful of caps thrown up from the bottom, spinning, then falling away.
  function toss() {
    if (reduce) return;
    const W = innerWidth, H = innerHeight, n = W < 600 ? 9 : 14;
    for (let i = 0; i < n; i++) {
      const el = document.createElement("div");
      el.innerHTML = capSvg("", false);
      el.className = "cv-fly";
      document.body.appendChild(el);
      const x0 = W * (0.15 + 0.7 * Math.random()), dx = (Math.random() - 0.5) * W * 0.35;
      const peak = H * (0.18 + 0.3 * Math.random()), spin = (Math.random() < 0.5 ? -1 : 1) * (240 + Math.random() * 360);
      const k = [];
      for (let t = 0; t <= 1.0001; t += 0.1) {
        const y = H + 30 - (H + 30 - peak) * 4 * t * (1 - t);
        k.push({ transform: `translate(${x0 + dx * t}px, ${t < 1 ? y : H + 60}px) rotate(${spin * t}deg)`, opacity: t > 0.85 ? (1 - t) / 0.15 : 1 });
      }
      el.animate(k, { duration: 1800 + Math.random() * 700, delay: i * 70, easing: "linear", fill: "forwards" })
        .finished.then(() => el.remove(), () => el.remove());
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      const day = now.getDate(), left = 19 - day;
      const eyebrow = document.querySelector(".hero-eyebrow");
      if (eyebrow) eyebrow.textContent = (q === "1" || left <= 0)
        ? "Year 3 · Convocation today · 19 Nov"
        : `Year 3 · Convocation in ${left} day${left === 1 ? "" : "s"} · 19 Nov`;
      const h = document.querySelector(".hero h1, .hero-text h1");
      if (h && !h.querySelector(".cv-cap")) {
        h.insertAdjacentHTML("beforeend", capSvg("cv-cap", true));
        const cap = h.querySelector(".cv-cap");
        cap.setAttribute("role", "button");
        cap.setAttribute("aria-label", "Toss the caps");
        cap.addEventListener("click", toss);
      }
      let seen = null;
      const key = "linkeen:convo-toss", today = now.toDateString();
      try { seen = localStorage.getItem(key); } catch (e) {}
      if (seen !== today) {
        try { localStorage.setItem(key, today); } catch (e) {}
        setTimeout(toss, 600);
      }
    }, 0);
  });
})();
