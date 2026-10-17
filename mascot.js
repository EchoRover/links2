// ================= MASCOT: SPARKY =================
// A ball of plasma that knows your schedule. He reads the same data the page
// already has (WEEKLY_CLASSES / classesOn, updatesData, MIDSEM_PAPERS from
// exam-mode.js) and turns it into one line at a time:
//   - on load he says the most urgent thing, then goes quiet
//   - each click steps through: next class -> nearest deadline -> next paper,
//     with one of his old creepy lines slipped in every few clicks
//   - his colour is the mood: calm, busy (due within 3 days), urgent (today)
//   - the badge counts things due in the next 3 days
// On pages without that data (cgpa) he just talks.

const SPARKY_SVG = `
<svg class="sp-svg" viewBox="0 0 64 64" aria-hidden="true">
  <defs>
    <radialGradient id="spCore" cx="40%" cy="35%" r="70%">
      <stop offset="0%" style="stop-color:var(--sp-hot)"/>
      <stop offset="28%" style="stop-color:var(--sp-core)"/>
      <stop offset="100%" style="stop-color:var(--sp-edge)"/>
    </radialGradient>
    <radialGradient id="spHalo" cx="50%" cy="50%" r="50%">
      <stop offset="40%" style="stop-color:var(--sp-core);stop-opacity:.45"/>
      <stop offset="100%" style="stop-color:var(--sp-core);stop-opacity:0"/>
    </radialGradient>
  </defs>
  <circle class="sp-halo" cx="32" cy="37" r="30" fill="url(#spHalo)"/>
  <path class="sp-bolt" d="M33 17 L29 10 L34 10 L31 2 L39 12 L34 12 L36 17 Z"/>
  <g class="sp-arcs">
    <polyline class="sp-arc a1" points="9,30 14,33 11,37 17,40"/>
    <polyline class="sp-arc a2" points="55,28 50,32 54,35 48,39"/>
    <polyline class="sp-arc a3" points="22,58 26,54 30,58 34,54 38,58"/>
  </g>
  <circle class="sp-orb" cx="32" cy="37" r="19" fill="url(#spCore)"/>
  <g class="sp-face">
    <g class="sp-eyes">
      <ellipse class="sp-eye" cx="25.5" cy="35" rx="4" ry="4.6"/>
      <ellipse class="sp-eye" cx="38.5" cy="35" rx="4" ry="4.6"/>
      <g class="sp-pupils">
        <circle class="sp-pupil" cx="25.5" cy="35.5" r="2.1"/>
        <circle class="sp-pupil" cx="38.5" cy="35.5" r="2.1"/>
      </g>
    </g>
    <path class="sp-mouth" d="M27.5 44 Q32 47.5 36.5 44"/>
  </g>
</svg>
<span class="sp-badge" hidden></span>`;

function initMascot() {
  const host = document.getElementById("sparky");
  const say = document.getElementById("sparky-say");
  if (!host || !say) return;
  host.insertAdjacentHTML("afterbegin", SPARKY_SVG);
  const badge = host.querySelector(".sp-badge");
  const pupils = host.querySelector(".sp-pupils");
  const examMode = document.documentElement.classList.contains("exam-mode");

  // ---------- his old voice, kept word for word ----------
  const safeQuips = [
    "i'm watching you breathe.",
    "don't look at the screen reflectively. i'm in there.",
    "your closet door was closed when you sat down. look at it now.",
    "do you hear that scratching? it's not a mouse.",
    "you are not alone. look at the reflection behind you.",
    "if you pause your music, you can hear breathing that isn't yours.",
    "your camera isn't off. it's just blinking.",
    "if you close your eyes, i'll get a little closer."
  ];
  const conspiracies = [
    "that shadow in the corner of your room? it just moved four inches closer.",
    "someone is standing outside your window right now, listening to your heartbeat.",
    "the air in your room just got colder. did you feel the breath on your neck?",
    "your phone uploads your dreams while you sleep. who do you think is buying them?",
    "the hum of your refrigerator is actually a frequency to keep you docile.",
    "if you blink, the room layout changes slightly. you just haven't noticed yet.",
    "every device in this room is recording your blinks. they are counting down.",
    "if you hear three knocks on your door tonight, do not look. do not answer.",
    "i am not a mascot. i am what is left of the last student who stayed up too late.",
    "your laptop battery is charging, yet it is unplugged. where is the power coming from?",
    "they are replacing your childhood memories one by one. do you really remember?",
    "your reflection in the mirror will blink a fraction of a second after you do.",
    "the clock is ticking backwards. check it. quickly.",
    "i'm not talking to you. i'm talking to the entity hovering over your shoulder.",
    "the webcam light isn't on, but the camera is still warm. feel it.",
    "i know you're alone in the room, but who is that reflecting in your screen right now?",
    "don't turn around. it hates when you look directly at it.",
    "your phone battery is draining because something is listening to your room.",
    "do you remember when you fell asleep? are you sure you're awake right now?",
    "the hum in your head is just the grid. it's inside you now."
  ];
  const examQuips = [
    "i ate the answer key. it screamed.",
    "the formula sheet is blank. it was always blank.",
    "your roll number is written on the wall of room 7. in red.",
    "the invigilator asked about you. by name.",
    "if you leave a question blank, something else answers it.",
    "don't sit in the last row. that seat is taken."
  ];

  // ---------- reading the page's data ----------
  const DAY = 86400000;
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const daysUntil = (d) => Math.round((startOfDay(d) - startOfDay(new Date())) / DAY);
  const toMins = (hhmm) => { const [h, m] = hhmm.trim().split(":").map(Number); return h * 60 + m; };
  const whenWord = (n) => (n === 0 ? "today" : n === 1 ? "tomorrow" : `in ${n} days`);
  const plain = (html) => { const t = document.createElement("div"); t.innerHTML = html; return t.textContent; };

  function nextClass() {
    if (typeof WEEKLY_CLASSES === "undefined" || typeof classesOn !== "function") return null;
    let batch = 1;
    try { batch = Number(localStorage.getItem("student-batch") || "1"); } catch (e) {}
    const now = new Date();
    for (let i = 0; i < 8; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      const dow = d.getDay();
      if (dow === 0 || dow === 6) continue;
      if (typeof dayOffReason === "function" && dayOffReason(d)) continue;
      const nowMins = i === 0 ? now.getHours() * 60 + now.getMinutes() : -1;
      const list = classesOn(d)
        .filter((c) => c.batch === undefined || c.batch === batch)
        .map((c) => ({ c, start: toMins(c.time.split("-")[0]), end: toMins(c.time.split("-")[1]) }))
        .filter((x) => x.end > nowMins)
        .sort((a, b) => a.start - b.start);
      if (!list.length) continue;
      const x = list[0];
      const room = typeof roomShort === "function" ? roomShort(x.c.room) : x.c.room;
      if (i === 0 && x.start <= nowMins) return { text: `you're in ${x.c.code} right now, ${room}. ${x.end - nowMins} min left.`, mins: 0 };
      const at = x.c.time.split("-")[0].trim();
      if (i === 0) {
        const m = x.start - nowMins;
        return { text: `${x.c.code} ${(x.c.type || "class").toLowerCase()} at ${at} in ${room}${m <= 60 ? `, ${m} min from now` : ""}.`, mins: m };
      }
      const dayName = i === 1 ? "tomorrow" : d.toLocaleDateString("en-GB", { weekday: "long" }).toLowerCase();
      return { text: `next class: ${x.c.code} ${dayName} at ${at}, ${room}.`, mins: Infinity };
    }
    return null;
  }

  function deadlines() {
    if (typeof updatesData === "undefined") return [];
    return updatesData
      .map(([cat, text, expiry]) => {
        const [y, m, d] = String(expiry).split("-").map(Number);
        let t = plain(text);
        const comma = t.lastIndexOf(",");
        if (/\d{2}\/\d{2}\/\d{4}\s*$/.test(t) && comma >= 0) t = t.slice(0, comma);
        return { cat, text: t.trim(), days: daysUntil(new Date(y, m - 1, d)) };
      })
      .filter((x) => x.days >= 0)
      .sort((a, b) => a.days - b.days);
  }

  function nextPaper() {
    const papers = window.MIDSEM_PAPERS || [];
    const now = new Date();
    const p = papers.find((x) => x.at > now);
    return p ? { ...p, days: daysUntil(p.at) } : null;
  }

  // ---------- turn it into lines + a mood ----------
  function briefing() {
    const lines = [];
    let mood = "calm";
    const bump = (m) => { if (m === "urgent" || (m === "busy" && mood === "calm")) mood = m; };

    const cls = nextClass();
    if (cls) { lines.push(cls.text); if (cls.mins <= 15) bump("urgent"); }

    const due = deadlines();
    const soon = due.filter((x) => x.days <= 3);
    if (due.length) {
      const d = due[0];
      lines.push(`${d.text}, ${whenWord(d.days)}.${soon.length > 1 ? ` (+${soon.length - 1} more this week)` : ""}`);
      bump(d.days === 0 ? "urgent" : d.days <= 3 ? "busy" : "calm");
    } else if (typeof updatesData !== "undefined") {
      lines.push("nothing due. suspicious.");
    }

    const p = nextPaper();
    if (p && p.days <= 14) {
      lines.push(examMode
        ? `${p.code} ${whenWord(p.days)}. it's waiting for you.`
        : `mid-sem: ${p.code} ${whenWord(p.days)}. portions are on the exams page.`);
      bump(p.days === 0 ? "urgent" : p.days <= 3 ? "busy" : "calm");
    }
    return { lines, mood, count: soon.length };
  }

  // ---------- speaking ----------
  let hideTimer = null;
  function speak(text, ms = 3200) {
    say.textContent = text;
    say.classList.remove("visible");
    void say.offsetWidth;
    say.classList.add("visible");
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => say.classList.remove("visible"), ms);
  }

  let info = briefing();
  function paint() {
    host.dataset.mood = info.mood;
    badge.hidden = info.count === 0;
    badge.textContent = info.count;
    host.setAttribute("aria-label", `Sparky. ${info.lines[0] || "click me"}`);
  }
  paint();
  setInterval(() => { info = briefing(); paint(); }, 60000);

  const lead = info.lines[0];
  setTimeout(() => speak(lead || pickOpener(), 4200), 900);

  function pickOpener() {
    const h = new Date().getHours();
    if (h >= 21 || h < 4) return "who is that standing right behind you?";
    if (h >= 5 && h < 9) return "you woke up. but did you really wake up?";
    return ["i can see you.", "i know you're there.", "there's no escape from the grid."][Math.floor(Math.random() * 3)];
  }

  let clicks = 0;
  let creepy = 0;
  host.addEventListener("click", () => {
    info = briefing(); paint();
    const cycle = [...info.lines, null]; // null = a creepy line
    const pick = cycle[clicks % cycle.length];
    clicks++;
    let text = pick;
    if (text === null) {
      const pool = examMode ? examQuips : creepy < safeQuips.length ? safeQuips : conspiracies;
      text = examMode || creepy >= safeQuips.length ? pool[Math.floor(Math.random() * pool.length)] : safeQuips[creepy];
      creepy++;
    }
    speak(text, Math.min(6000, 2200 + text.length * 35));
    host.classList.remove("zap");
    void host.offsetWidth;
    host.classList.add("zap");
    spawnSparks();
  });

  say.addEventListener("click", (e) => { e.stopPropagation(); say.classList.remove("visible"); });

  function spawnSparks() {
    const rect = host.getBoundingClientRect();
    const cx = rect.left + rect.width / 2 + window.scrollX;
    const cy = rect.top + rect.height / 2 + window.scrollY;
    for (let i = 0; i < 8; i++) {
      const s = document.createElement("div");
      s.className = "spark-particle";
      const a = Math.random() * Math.PI * 2, dist = 30 + Math.random() * 40;
      s.style.left = `${cx}px`;
      s.style.top = `${cy}px`;
      s.style.setProperty("--tx", `${Math.cos(a) * dist}px`);
      s.style.setProperty("--ty", `${Math.sin(a) * dist}px`);
      const sz = 3 + Math.random() * 5;
      s.style.width = `${sz}px`;
      s.style.height = `${sz}px`;
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 600);
    }
  }

  // pupils follow the cursor
  window.addEventListener("mousemove", (e) => {
    const r = host.getBoundingClientRect();
    const ang = Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2));
    pupils.setAttribute("transform", `translate(${(Math.cos(ang) * 1.6).toFixed(2)} ${(Math.sin(ang) * 1.6).toFixed(2)})`);
  });
}

// Started by scripts.js on DOMContentLoaded.
