// ============================================================
// exam-mode.js — the site turns on you during mid-sems.
//
// Active from the first paper to the end of the last one (Year 3 mid-term
// PDF: 24–29 Oct 2026). Only the look and the fluff change: palette, fonts,
// background, mascot lines, greeting, footer quote, tab title. Links,
// timetable, agenda and course cards keep working exactly as before.
//
//   ?scary=1  preview it any day      ?scary=0  switch it off
//
// Loaded in <head> (sync) so the class lands before first paint; the
// fluff overrides run after every other DOMContentLoaded handler.
// ============================================================

(function () {
  const EXAM_START = new Date(2026, 9, 24, 0, 0);
  const EXAM_END = new Date(2026, 9, 30, 0, 0);   // exclusive: through 29 Oct

  // Same papers as exams.js; duplicated so the home page needn't load it.
  const PAPERS = [
    { code: "AHUL256", at: new Date(2026, 9, 24, 10, 30) },
    { code: "ASBL100", at: new Date(2026, 9, 26, 11, 30) },
    { code: "AHUL261", at: new Date(2026, 9, 27, 14, 30) },
    { code: "AENL226", at: new Date(2026, 9, 28, 14, 30) },
    { code: "AENL228", at: new Date(2026, 9, 29, 8, 30) }
  ];

  // Sparky reads this for his "next paper" line, exam mode or not.
  window.MIDSEM_PAPERS = PAPERS;

  const flag = new URLSearchParams(location.search).get("scary");
  const now = new Date();
  const on = flag === "1" || (flag !== "0" && now >= EXAM_START && now < EXAM_END);
  if (!on) return;

  const root = document.documentElement;
  root.classList.add("exam-mode");
  // The dark palette is the one the horror tokens are built on; hold it there.
  root.setAttribute("data-theme", "dark");
  new MutationObserver(() => {
    if (root.getAttribute("data-theme") !== "dark") root.setAttribute("data-theme", "dark");
  }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });

  const font = document.createElement("link");
  font.rel = "stylesheet";
  font.href = "https://fonts.googleapis.com/css2?family=Creepster&family=Special+Elite&display=swap";
  document.head.appendChild(font);

  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const rand = (a, b) => a + Math.random() * (b - a);

  function nextPaper() {
    const t = new Date();
    return PAPERS.find((p) => p.at > t) || null;
  }
  function untilText(p) {
    const mins = Math.max(0, Math.round((p.at - new Date()) / 60000));
    if (mins < 60) return `${mins} minutes`;
    const h = Math.round(mins / 60);
    if (h < 36) return `${h} hours`;
    return `${Math.round(h / 24)} days`;
  }

  const QUOTES = [
    "It knows which chapters you skipped.",
    "The syllabus was longer last night. It grew.",
    "Somebody in the exam hall has been sitting there since 2019.",
    "Pens run out of ink only when they are watched.",
    "The invigilator never blinks. Check.",
    "You read that page already. Read it again. It changed.",
    "Do not count the students. There is always one more.",
    "The clock in the hall runs four minutes fast. For you.",
    "Every blank answer sheet was once a student.",
    "It whispers the formulas, but only the wrong ones.",
    "Your seat number was chosen before you were born.",
    "Nobody remembers who set this paper."
  ];


  function greeting() {
    const p = nextPaper();
    const left = PAPERS.filter((x) => x.at > new Date()).length;
    if (!p) return "it's over. or is it.";
    return `${left} paper${left === 1 ? "" : "s"} left · ${p.code} in ${untilText(p)} · it's watching`;
  }

  // ---------- background: drips, eyes, a figure ----------
  function buildBackground() {
    const bg = document.getElementById("bg");
    if (!bg) return;
    bg.querySelectorAll(".leaf").forEach((l) => l.remove());

    const drips = document.createElement("div");
    drips.className = "xm-drips";
    const n = window.innerWidth < 600 ? 9 : 18;
    for (let i = 0; i < n; i++) {
      const d = document.createElement("span");
      d.className = "xm-drip";
      d.style.setProperty("--x", rand(0, 100).toFixed(1) + "vw");
      d.style.setProperty("--w", rand(5, 13).toFixed(0) + "px");
      d.style.setProperty("--len", rand(40, window.innerWidth < 600 ? 110 : 190).toFixed(0) + "px");
      d.style.setProperty("--dur", rand(7, 16).toFixed(1) + "s");
      d.style.animationDelay = (-rand(0, 14)).toFixed(1) + "s";
      drips.appendChild(d);
    }
    document.body.appendChild(drips);

    const veil = document.createElement("div");
    veil.className = "xm-veil";
    document.body.appendChild(veil);

    // claw marks in a corner, as if something tried to get out
    const claws = document.createElement("div");
    claws.className = "xm-claws";
    claws.innerHTML =
      '<svg viewBox="0 0 200 260" aria-hidden="true">' +
      '<path d="M40 10 C 52 90, 50 170, 30 250"/><path d="M80 0 C 92 85, 92 175, 72 255"/>' +
      '<path d="M120 12 C 130 95, 128 170, 112 245"/><path d="M158 30 C 166 100, 164 160, 150 230"/></svg>';
    document.body.appendChild(claws);

    // a hand dragged down the left edge
    const hand = document.createElement("div");
    hand.className = "xm-hand";
    hand.innerHTML =
      '<svg viewBox="0 0 120 360" aria-hidden="true">' +
      '<path d="M30 70c-4-22-2-48 6-50s9 26 10 46c1-30 3-60 12-60s9 34 8 62c3-26 8-50 16-48s6 30 2 56c5-16 12-30 19-27s-2 30-10 52c-8 22-20 36-40 38-16 2-24-12-23-30z"/>' +
      '<path d="M34 120c6 60 2 130 10 230M58 124c2 70 8 140 4 220M80 116c4 50-2 110 6 170" class="smear"/></svg>';
    document.body.appendChild(hand);

    if (reduce) return;

    function eyes() {
      const e = document.createElement("span");
      e.className = "xm-eyes";
      e.style.left = rand(3, 92).toFixed(1) + "vw";
      e.style.top = rand(20, 92).toFixed(1) + "vh";
      e.style.setProperty("--s", rand(0.6, 1.4).toFixed(2));
      e.innerHTML = "<i></i><i></i>";
      bg.appendChild(e);
      setTimeout(() => e.remove(), 6200);
      setTimeout(eyes, rand(3500, 9000));
    }
    setTimeout(eyes, 1800);

    function figure() {
      const f = document.createElement("div");
      f.className = "xm-figure" + (Math.random() < 0.5 ? " rtl" : "");
      f.innerHTML =
        '<svg viewBox="0 0 60 200" aria-hidden="true"><path d="M30 6c9 0 14 8 14 18s-5 18-14 18-14-8-14-18 5-18 14-18zM14 44c6-3 26-3 32 0 7 22 10 70 8 150H6C4 114 7 66 14 44z"/></svg>';
      document.body.appendChild(f);
      setTimeout(() => f.remove(), 9000);
      setTimeout(figure, rand(35000, 80000));
    }
    setTimeout(figure, rand(9000, 18000));

    // words that surface in the dark and sink back
    const WORDS = ["IT KNOWS", "TOO LATE", "BEHIND YOU", "YOU DIDN'T STUDY", "STAY", "WE SEE YOU", "ONE MORE CHAPTER", "WAKE UP"];
    function word() {
      const w = document.createElement("span");
      w.className = "xm-word";
      w.textContent = pick(WORDS);
      w.style.left = rand(2, 60).toFixed(1) + "vw";
      w.style.top = rand(15, 80).toFixed(1) + "vh";
      w.style.setProperty("--r", rand(-14, 14).toFixed(0) + "deg");
      bg.appendChild(w);
      setTimeout(() => w.remove(), 9000);
      setTimeout(word, rand(12000, 26000));
    }
    setTimeout(word, rand(4000, 8000));
  }

  // ---------- fluff text ----------
  function rewriteFluff() {
    const eyebrow = document.querySelector(".hero-eyebrow");
    if (eyebrow) eyebrow.textContent = "Year 3 · Mid-sems · 24–29 Oct · it has begun";
    const sub = document.getElementById("hero-sub");
    if (sub) {
      sub.textContent = greeting();
      setInterval(() => { sub.textContent = greeting(); }, 60000);
    }
    const quote = document.getElementById("footer-quote");
    if (quote) quote.innerHTML = `<span class="q-body">${pick(QUOTES)}</span>`;
    const updTitle = document.querySelector(".updates-title");
    if (updTitle) updTitle.textContent = "What awaits you";

    // The theme button no longer turns the lights on.
    const toggle = document.getElementById("theme-toggle");
    if (toggle) {
      toggle.title = "the lights don't work";
      toggle.addEventListener("click", () => {
        root.classList.remove("xm-blackout");
        void root.offsetWidth;
        root.classList.add("xm-blackout");
      });
    }

    const realTitle = document.title;
    document.addEventListener("visibilitychange", () => {
      document.title = document.hidden ? pick(["come back.", "it's still here.", "don't leave me with it.", "you left the page open."]) : realTitle;
    });
  }

  window.addEventListener("DOMContentLoaded", () => {
    // After every other DOMContentLoaded handler has written its own text.
    setTimeout(() => { buildBackground(); rewriteFluff(); }, 0);
  });
})();
