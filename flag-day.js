// ============================================================
// flag-day.js — UAE Flag Day (3 Nov). Took over from the Halloween skin.
//
// On 2–3 Nov 2026 (or any day with ?flag=1; ?flag=0 turns it off): a thin
// flag ribbon along the top, a small flag beside the greeting, and the
// eyebrow line. Links, timetable and cards are untouched.
// ============================================================

(function () {
  const START = new Date(2026, 10, 2, 0, 0);
  const END = new Date(2026, 10, 4, 0, 0);   // exclusive: through 3 Nov
  const q = new URLSearchParams(location.search).get("flag");
  const now = new Date();
  if (q === "0" || (q !== "1" && (now < START || now >= END))) return;

  document.documentElement.classList.add("flag-day");

  const css = `
    html.flag-day body::before {
      content: ""; position: fixed; inset: 0 0 auto 0; height: 6px; z-index: 50; pointer-events: none;
      background:
        linear-gradient(90deg, #c8102e 0 64px, transparent 64px),
        linear-gradient(#00843d 0 2px, #f4f1ea 2px 4px, #111 4px 6px);
    }
    .fd-flag { display: inline-block; width: 30px; height: 20px; margin-left: 10px; vertical-align: -2px;
      transform-origin: left center; animation: fd-wave 3.2s ease-in-out infinite; border-radius: 2px;
      box-shadow: 0 1px 2px rgba(0,0,0,.18); }
    @keyframes fd-wave { 0%,100% { transform: skewY(0deg) scaleX(1); } 50% { transform: skewY(-3deg) scaleX(.94); } }
    @media (prefers-reduced-motion: reduce) { .fd-flag { animation: none; } }
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  const FLAG = '<svg class="fd-flag" viewBox="0 0 12 6" aria-hidden="true" preserveAspectRatio="none">' +
    '<rect width="12" height="2" y="0" fill="#00843d"/><rect width="12" height="2" y="2" fill="#fff"/>' +
    '<rect width="12" height="2" y="4" fill="#000"/><rect width="3" height="6" fill="#c8102e"/></svg>';

  window.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      const eyebrow = document.querySelector(".hero-eyebrow");
      if (eyebrow) eyebrow.textContent = now.getDate() === 3 || q === "1"
        ? "Year 3 · UAE Flag Day · 3 Nov"
        : "Year 3 · Flag Day tomorrow · 3 Nov";
      const h = document.querySelector(".hero h1, .hero-text h1");
      if (h && !h.querySelector(".fd-flag")) h.insertAdjacentHTML("beforeend", FLAG);
    }, 0);
  });
})();
