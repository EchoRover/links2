// ============================================================
// national-day.js — UAE National Day / Eid Al Etihad (2 Dec).
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
      content: ""; position: fixed; inset: 0 0 auto 0; height: 6px; z-index: 50; pointer-events: none;
      background:
        linear-gradient(90deg, #c8102e 0 72px, transparent 72px),
        linear-gradient(#00843d 0 2px, #f4f1ea 2px 4px, #111 4px 6px);
    }
    .nd-flag { display: inline-block; width: 30px; height: 20px; margin-left: 12px; vertical-align: -1px;
      transform-origin: left center; animation: nd-wave 3.2s ease-in-out infinite; border-radius: 2px;
      box-shadow: 0 0 0 1px rgba(127,127,127,.25); }
    @keyframes nd-wave { 0%,100% { transform: skewY(0deg) scaleX(1); } 50% { transform: skewY(-3deg) scaleX(.94); } }
    .nd-pill { display: inline-block; align-self: flex-start; width: fit-content; margin-top: 6px; padding: 4px 10px;
      border-radius: 999px; font-size: .78rem; font-weight: 600; color: var(--text);
      background: color-mix(in srgb, #00843d 14%, transparent); border: 1px solid color-mix(in srgb, #00843d 40%, transparent); }
    .nd-pill b { color: #c8102e; font-weight: 700; }
    :root[data-theme="dark"] .nd-pill b { color: #ff5a6e; }
    html.national-day .live-tracker-bar { position: relative; overflow: hidden; }
    html.national-day .live-tracker-bar::before { content: ""; position: absolute; inset: 0 0 auto 0; height: 3px;
      background: linear-gradient(90deg, #c8102e 0 18%, #00843d 18% 45%, #f4f1ea 45% 72%, #111 72%); }
    @media (prefers-reduced-motion: reduce) { .nd-flag { animation: none; } }
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  const FLAG = '<svg class="nd-flag" viewBox="0 0 12 6" aria-hidden="true" preserveAspectRatio="none">' +
    '<rect width="12" height="2" y="0" fill="#00843d"/><rect width="12" height="2" y="2" fill="#fff"/>' +
    '<rect width="12" height="2" y="4" fill="#000"/><rect width="3" height="6" fill="#c8102e"/></svg>';

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((DAY - today) / 864e5);
  const text = days > 0 ? `Eid Al Etihad in <b>${days} day${days === 1 ? "" : "s"}</b> · 2 Dec`
    : days === 0 ? "<b>Eid Al Etihad Mubarak</b> · 55 years of the UAE"
    : "<b>Eid Al Etihad</b> · 55 years of the UAE";

  window.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      const h = document.querySelector(".hero h1, .hero-text h1");
      if (h && !h.querySelector(".nd-flag")) h.insertAdjacentHTML("beforeend", FLAG);
      const box = document.querySelector(".hero-text");
      if (box && !box.querySelector(".nd-pill")) box.insertAdjacentHTML("beforeend", `<span class="nd-pill">${text}</span>`);
    }, 0);
  });
})();
