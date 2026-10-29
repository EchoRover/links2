// ============================================================
// exam-mode.js — the site turns on you during mid-sems.
//
// Active from the first paper to the end of the last one (Year 3 mid-term
// PDF: 24–29 Oct 2026), then as Halloween through Diwali, 8 Nov (html.halloween:
// pumpkin, spider, bats, new lines; jumpscare.js rides along the whole
// time). Only the look and the fluff change: palette, fonts,
// background, mascot lines, greeting, footer quote, tab title. Links,
// timetable, agenda and course cards keep working exactly as before.
//
//   ?scary=1  preview it any day      ?scary=0  switch it off
//   ?halloween=1  with ?scary=1, preview the Halloween half
//
// Loaded in <head> (sync) so the class lands before first paint; the
// fluff overrides run after every other DOMContentLoaded handler.
// ============================================================

(function () {
  const EXAM_START = new Date(2026, 9, 24, 0, 0);
  const EXAM_END = new Date(2026, 9, 30, 0, 0);   // exclusive: through 29 Oct

  // Same papers as exams.js; duplicated so the home page needn't load it.
  // `report` is when students must be in the hall, 30 min before the start.
  const PAPERS = [
    { code: "AHUL256", name: "Critical Thinking", at: new Date(2026, 9, 24, 10, 30), report: new Date(2026, 9, 24, 10, 0) },
    { code: "ASBL100", name: "Introductory Biology for Engineers", at: new Date(2026, 9, 26, 11, 30), report: new Date(2026, 9, 26, 11, 0) },
    { code: "AHUL261", name: "Introduction to Psychology", at: new Date(2026, 9, 27, 14, 30), report: new Date(2026, 9, 27, 14, 0) },
    { code: "AENL226", name: "Power Electronics and Power Systems", at: new Date(2026, 9, 28, 14, 30), report: new Date(2026, 9, 28, 14, 0), calc: true },
    { code: "AENL228", name: "Measurement & Instrumentation", at: new Date(2026, 9, 29, 8, 30), report: new Date(2026, 9, 29, 8, 0), calc: true }
  ];

  // Sparky and the exam-day card read this, exam mode or not.
  window.MIDSEM_PAPERS = PAPERS;

  // Halloween keeps the same skin running after the last paper, through
  // Diwali (Sun 8 Nov 2026).
  const HALLOWEEN_END = new Date(2026, 10, 9, 0, 0);   // exclusive

  const flag = new URLSearchParams(location.search).get("scary");
  const now = new Date();
  const on = flag === "1" || (flag !== "0" && now >= EXAM_START && now < HALLOWEEN_END);
  if (!on) return;
  // ?scary=1 previews the Halloween half after the exams, the exam half before.
  const halloween = now >= EXAM_END || new URLSearchParams(location.search).get("halloween") === "1";

  const root = document.documentElement;
  root.classList.add("exam-mode");
  if (halloween) root.classList.add("halloween");
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


  const HW_QUOTES = [
    "The exams are over. Whatever was in the hall followed you home.",
    "Count the pumpkins on your street. Now count them again.",
    "Don't answer the door after midnight. Nobody is trick-or-treating.",
    "Your reflection blinked first.",
    "The candle went out because something leaned over it.",
    "It wore your face to the last exam. You weren't there.",
    "Leave a light on. It doesn't help, but leave it on.",
    "There were five of you in the photo. You came as four."
  ];

  function hwGreeting() {
    const t = new Date();
    const end = new Date(2026, 9, 31, 23, 59, 59);
    if (t.getDate() === 31 && t.getMonth() === 9) return "it's Halloween · don't look behind you · don't look behind you";
    if (t > end) {
      const d = Math.ceil((new Date(2026, 10, 8) - t) / 864e5);
      if (d <= 0) return "happy Diwali · the lights are on · it's still standing in the corner";
      return `Halloween is over · it didn't leave · ${d} day${d === 1 ? "" : "s"} till Diwali lights it up`;
    }
    const h = Math.max(0, Math.round((end - t) / 3600000));
    return `${h} hours until Halloween · the exams are over · it isn't`;
  }

  function greeting() {
    if (halloween) return hwGreeting();
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

    if (halloween) buildHalloween(bg);
  }

  // ---------- Halloween props: jack-o'-lantern, spider, bats ----------
  function buildHalloween(bg) {
    const jack = document.createElement("div");
    jack.className = "hw-jack";
    jack.innerHTML =
      '<svg viewBox="0 0 160 140" aria-hidden="true">' +
      '<path class="stem" d="M76 26c-2-10 2-20 12-24l4 6c-7 3-8 10-6 18z"/>' +
      '<ellipse class="body" cx="80" cy="82" rx="74" ry="56"/>' +
      '<path class="rib" d="M80 28c-18 18-18 92 0 110M80 28c18 18 18 92 0 110M42 36c-26 24-24 76 2 98M118 36c26 24 24 76-2 98"/>' +
      '<g class="glow"><path d="M38 66l22-6 6 20zM122 66l-22-6-6 20zM74 86l6-14 6 14z"/>' +
      '<path d="M32 98c16 18 80 18 96 0-4 22-20 30-48 30s-44-8-48-30zm22 4v10h10v-8zm42 2v10h10v-12z"/></g></svg>';
    document.body.appendChild(jack);

    const spider = document.createElement("div");
    spider.className = "hw-spider";
    spider.innerHTML =
      '<svg viewBox="0 0 60 60" aria-hidden="true"><g stroke="#000" stroke-width="2.4" fill="none" stroke-linecap="round">' +
      '<path d="M24 30C14 22 8 24 3 14M24 34C12 32 6 36 2 30M24 37C12 40 8 46 4 50M26 40C18 48 16 54 14 59"/>' +
      '<path d="M36 30c10-8 16-6 21-16M36 34c12-2 18 2 22-4M36 37c12 3 16 9 20 13M34 40c8 8 10 14 12 19"/></g>' +
      '<ellipse cx="30" cy="36" rx="9" ry="11" fill="#000"/><circle cx="30" cy="23" r="6" fill="#000"/>' +
      '<circle cx="28" cy="22" r="1.3" fill="#ff1a26"/><circle cx="32" cy="22" r="1.3" fill="#ff1a26"/></svg>';
    document.body.appendChild(spider);

    if (reduce) return;
    function bats() {
      const n = 3 + Math.floor(Math.random() * 4);
      const y = rand(8, 45);
      const rtl = Math.random() < 0.5;
      for (let i = 0; i < n; i++) {
        const b = document.createElement("span");
        b.className = "hw-bat" + (rtl ? " rtl" : "");
        b.style.top = (y + rand(-6, 6)).toFixed(1) + "vh";
        b.style.setProperty("--s", rand(0.5, 1.2).toFixed(2));
        b.style.animationDelay = (i * rand(0.15, 0.5)).toFixed(2) + "s";
        b.innerHTML = '<svg viewBox="0 0 64 28" aria-hidden="true"><path d="M32 10c2-4 4-4 5 0 4-6 14-10 27-8-6 4-8 10-7 16-4-3-9-3-12 1-2-4-6-5-9-2-1 3-3 5-4 5s-3-2-4-5c-3-3-7-2-9 2-3-4-8-4-12-1 1-6-1-12-7-16 13-2 23 2 27 8 1-4 3-4 5 0z"/></svg>';
        bg.appendChild(b);
        setTimeout(() => b.remove(), 9000);
      }
      setTimeout(bats, rand(14000, 30000));
    }
    setTimeout(bats, rand(2000, 5000));
  }

  // ---------- fluff text ----------
  function rewriteFluff() {
    const eyebrow = document.querySelector(".hero-eyebrow");
    if (eyebrow) eyebrow.textContent = halloween
      ? (new Date() > new Date(2026, 9, 31, 23, 59, 59)
        ? "Year 3 · after Halloween · it stayed · till Diwali"
        : "Year 3 · Halloween · 31 Oct · it followed you home")
      : "Year 3 · Mid-sems · 24–29 Oct · it has begun";
    const sub = document.getElementById("hero-sub");
    if (sub) {
      sub.textContent = greeting();
      setInterval(() => { sub.textContent = greeting(); }, 60000);
    }
    const quote = document.getElementById("footer-quote");
    if (quote) quote.innerHTML = `<span class="q-body">${pick(halloween ? HW_QUOTES : QUOTES)}</span>`;
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
        if (window.Jumpscare) setTimeout(() => window.Jumpscare.fire("dark"), 500);
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
