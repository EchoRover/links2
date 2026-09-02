const COURSE_COLORS = (typeof window !== "undefined" && window.COURSE_COLORS) || {
  AENL226: "#3b82f6",
  AENL228: "#f59e0b",
  AENP200: "#10b981",
  AENP225: "#06b6d4",
  AHUL256: "#ec4899",
  AHUL261: "#8b5cf6",
  ASBL100: "#14b8a6",
  AGRL130: "#f97316"
};

const COURSE_TITLES = {
  AENL226: "Power Electronics and Power Systems",
  AENL228: "Measurement & Instrumentation for Energy Systems",
  AENP200: "Energy Technology Lab",
  AENP225: "Electrical Energy Laboratory",
  AHUL256: "Critical Thinking",
  AHUL261: "Introduction to Psychology",
  ASBL100: "Introductory Biology for Engineers",
  AGRL130: "Innovation, Entrepreneurship, and Sustainability"
};

// ============================================================
// scripts.js — INDEX page only.
// Shared helpers live in shared.js
// ============================================================

const linksData = {
  general: {
    ERP: "https://iitdadierp.iitd.ac.in/student/login",
    CGPA: "cgpa",
    Teams: "https://teams.microsoft.com/",
    Outlook: "https://outlook.office.com/",
    Blackboard: "https://iida.blackboard.com/ultra/course",
    TimeTable: "timetable.pdf",
    Bus: "bus",
    Rooms: "rooms",
    "3D Map": "both",
    "Campus Tools": "campustools",
    Common: "common",
    "Free Time": "free",
    Campus: "campus",
    linkCS: {
      url: "https://linkcs.vercel.app",
      className: "cs-link",
      quip: "If your code crashes, talk to them ↗",
      quipTop: "you and i are polar opposites"
    }
  },
  courses: {
    "AENL226 (Power Electronics and Power Systems)": { 
      credits: 4, ltp: "3-1-0", 
      prof: "Prof. Anandarup Das, Prof. Ashu Verma", cabin: "Faculty Cabin", room: "M2.2.007 / M4-0-011", 
      links: {
        "Blackboard": "https://iida.blackboard.com/ultra/courses/_162_1/outline"
      } 
    },
    "AENL228 (Measurement & Instrumentation for Energy Systems)": { 
      credits: 3, ltp: "2-0-2", 
      prof: "Prof. K. Ravi Kumar", cabin: "Faculty Cabin", room: "M2.2.007 / M2.2.031", 
      links: {
        "Blackboard": "https://iida.blackboard.com/ultra/courses/_163_1/outline"
      } 
    },
    "AENP200 (Energy Technology Lab)": { 
      credits: 1.5, ltp: "0-0-3", 
      prof: "Prof. Dibakar Rakshit", cabin: "Faculty Cabin", room: "M3-1-009", 
      links: {
        "Blackboard": "https://iida.blackboard.com/ultra/courses/_164_1/outline"
      } 
    },
    "AENP225 (Electrical Energy Laboratory)": { 
      credits: 1.5, ltp: "0-0-3", 
      prof: "Prof. Anandarup Das", cabin: "Faculty Cabin", room: "M3-1-009", 
      links: {
        "Blackboard": "https://iida.blackboard.com/ultra/courses/_165_1/outline"
      } 
    },
    "AHUL256 (Critical Thinking)": { 
      credits: 4, ltp: "3-1-0", 
      prof: "Prof. Arjun Ghosh", cabin: "Faculty Cabin", room: "M4-0-011 / M4-1-017", 
      links: {
        "Blackboard": "https://iida.blackboard.com/ultra/courses/_182_1/outline"
      } 
    },
    "AHUL261 (Introduction to Psychology)": { 
      credits: 4, ltp: "3-1-0", 
      prof: "Prof. Yashpal Ashokrao Jogdand", cabin: "Faculty Cabin", room: "M4-0-011 / M4-1-017", 
      links: {
        "Blackboard": "https://iida.blackboard.com/ultra/courses/_183_1/outline"
      } 
    },
    "ASBL100 (Introductory Biology for Engineers)": { 
      credits: 4, ltp: "3-0-2", 
      prof: "Prof. Saurabh Raj", cabin: "Faculty Cabin", room: "M2.2.007 / M3-1-031", 
      links: {
        "Blackboard": "https://iida.blackboard.com/ultra/courses/_190_1/outline"
      } 
    },
    "AGRL130 (Innovation, Entrepreneurship, and Sustainability)": { 
      credits: 3, ltp: "3-0-0", 
      prof: "Prof. Joby Joseph, Prof. Ashu Verma", cabin: "Faculty Cabin", room: "M4-0-011", 
      links: {
        "Blackboard": "https://iida.blackboard.com/ultra/courses/_179_1/outline"
      } 
    }
  }
};

const updatesData = [];
// 14 verified portrait 9:16 reels (idk4 is landscape 16:9, idk6 is 4:3)
const portraitClipIndices = [1, 2, 3, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
const localClips = portraitClipIndices.map(i => `idk${i}.mp4`);

function getDailyReels() {
  const today = new Date();
  const dateSeed = today.getFullYear() * 1000 + today.getMonth() * 100 + today.getDate();
  
  // Simple deterministic hash based on date seed
  let index1 = dateSeed % localClips.length;
  let index2 = (dateSeed * 7 + 13) % localClips.length;
  
  // Ensure they are not the same video
  if (index1 === index2) {
    index2 = (index1 + 1) % localClips.length;
  }
  
  return [localClips[index1], localClips[index2]];
}

function renderLocalClips() {
  const [vid1, vid2] = getDailyReels();
  const leftVid = document.getElementById("local-clip-left");
  const rightVid = document.getElementById("local-clip-right");
  
  if (leftVid) {
    leftVid.src = vid1;
    leftVid.muted = true;
    leftVid.playsInline = true;
    leftVid.loop = true;
    leftVid.autoplay = true;
    leftVid.load();
    leftVid.play().catch(() => {});
  }
  if (rightVid) {
    rightVid.src = vid2;
    rightVid.muted = true;
    rightVid.playsInline = true;
    rightVid.loop = true;
    rightVid.autoplay = true;
    rightVid.load();
    rightVid.play().catch(() => {});
  }
}

function addUpdate(category, text, expiry) { updatesData.push([category, text, expiry]); }

function renderUpdates() {
  const now = new Date();
  const grouped = {};
  updatesData.forEach(([category, text, expiry]) => {
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push([text, expiry]);
  });
  
  const categories = [
    { id: "assignments", title: "📋 Assignments", tag: "Tasks & Reports" },
    { id: "quizzes", title: "📝 Quizzes & Tests", tag: "Evaluations" }
  ];

  let totalActive = 0;

  categories.forEach(cat => {
    const container = document.getElementById(cat.id + "-box");
    if (!container) return;
    
    container.innerHTML = "";

    const items = grouped[cat.id] || [];
    const validItems = [];
    
    items.forEach(([text, expiry]) => {
      const parts = String(expiry).split("-").map(Number);
      if (parts.length !== 3) return;
      const [y, m, d] = parts;
      const expiryExclusive = new Date(y, m - 1, d + 1);
      if (now < expiryExclusive) {
        validItems.push({ text, expiry, y, m, d });
      }
    });

    // Box header with active count badge
    const headerEl = document.createElement("div");
    headerEl.className = "box-head-row";
    headerEl.innerHTML = `
      <div class="box-title-wrap">
        <h2>${cat.title}</h2>
        <span class="box-subtitle">${cat.tag}</span>
      </div>
      <span class="box-count-badge ${cat.id === 'quizzes' && validItems.length > 0 ? 'alert' : ''}">
        ${validItems.length} ${validItems.length === 1 ? 'item' : 'items'}
      </span>
    `;
    container.appendChild(headerEl);

    if (validItems.length === 0) {
      const p = document.createElement("div");
      p.className = "update-empty";
      p.innerHTML = "✨ All caught up! No pending tasks.";
      container.appendChild(p);
      return;
    }

    validItems.forEach(({ text, y, m, d }) => {
      const dateObj = new Date(y, m - 1, d);
      const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dateObj.getDay()];
      const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][dateObj.getMonth()];

      const msPerDay = 1000 * 60 * 60 * 24;
      const endOfDay = new Date(y, m - 1, d, 23, 59, 59);
      const daysDiff = Math.ceil((endOfDay - now) / msPerDay);
      let countdownLabel = "";
      if (daysDiff <= 0) countdownLabel = "Due today!";
      else if (daysDiff === 1) countdownLabel = "Due tomorrow!";
      else countdownLabel = `⏱ in ${daysDiff} days`;

      const colon = text.indexOf(":");
      const code = colon >= 0 ? text.slice(0, colon).trim() : "";
      let event = colon >= 0 ? text.slice(colon + 1).trim() : text;
      const comma = event.lastIndexOf(",");
      if (comma >= 0) event = event.slice(0, comma).trim();

      const clr = (typeof COURSE_COLORS !== "undefined" && COURSE_COLORS[code]) || "var(--accent)";

      const card = document.createElement("div");
      card.className = "update-card-item";
      card.innerHTML = `
        <div class="update-date-badge">
          <span class="upd-dow">${DOW}</span>
          <span class="upd-day">${String(d).padStart(2, "0")}</span>
          <span class="upd-mon">${MON}</span>
        </div>
        <div class="update-info">
          <div class="update-tag-row">
            ${code ? `<span class="upd-code" style="color: ${clr}; border-color: ${clr}; background: color-mix(in srgb, ${clr} 12%, transparent);">${code}</span>` : ""}
            <span class="upd-countdown ${daysDiff <= 3 ? 'urgent' : ''}">${countdownLabel}</span>
          </div>
          <div class="upd-text">${event}</div>
        </div>
      `;
      container.appendChild(card);
      totalActive++;
    });
  });

  const mainHeader = document.querySelector(".updates-header");
  if (mainHeader) {
    let badge = mainHeader.querySelector(".agenda-count-badge");
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "agenda-count-badge";
      mainHeader.appendChild(badge);
    }
    badge.textContent = `${totalActive} Active`;
  }
}

const SEM_CONFIG = { number: 5, startDate: "2026-08-03" };

function buildHeroSub() {
  const sub = document.getElementById("hero-sub");
  if (!sub) return;
  const now = new Date();
  const h = now.getHours();
  let greeting;
  if (h >= 5 && h < 12) greeting = "good morning";
  else if (h >= 12 && h < 17) greeting = "good afternoon";
  else if (h >= 17 && h < 21) greeting = "good evening";
  else if (h >= 21 || h < 1) greeting = "burning the midnight oil";
  else greeting = "the witching hour";
  const start = new Date(SEM_CONFIG.startDate + "T00:00:00");
  const msPerDay = 1000 * 60 * 60 * 24;
  const diffDays = Math.floor((now - start) / msPerDay);
  let counter;
  if (diffDays < 0) counter = `sem ${SEM_CONFIG.number} starts in ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? "" : "s"}`;
  else if (diffDays === 0) counter = `day 1 of sem ${SEM_CONFIG.number}, the first one`;
  else counter = `day ${diffDays + 1} of sem ${SEM_CONFIG.number}`;
  sub.textContent = `${greeting} · ${counter}`;
}

// Room codes -> what people actually call the room.
const ROOM_NAMES = {
  "M4-0-011": "Classroom 3",
  "M4-1-017": "Classroom 7",
  "M3-1-009": "Energy Lab",
  "M3-1-031": "Biology Lab",
  "M2-2-007": "Classroom 7 (M2)",
  "M2-2-031": "Measurement Lab"
};

function roomShort(code) {
  if (!code) return "";
  return String(code).split("/").map(part => {
    const raw = part.trim();
    return ROOM_NAMES[raw] || raw;
  }).join(" / ");
}

function roomLabel(code) {
  if (!code) return "";
  return String(code).split("/").map(part => {
    const raw = part.trim();
    const name = ROOM_NAMES[raw];
    return name ? `${name} (${raw})` : raw;
  }).join(" / ");
}

const WEEKLY_CLASSES = {
  1: [ // Monday
    { code: "AENL226", name: "Power Electronics and Power Systems", time: "10:00-10:50", room: "M2-2-007", type: "Help Session" },
    { code: "AENL228", name: "Measurement & Instrumentation", time: "11:00-11:50", room: "M2-2-007", type: "Lecture" },
    { code: "AHUL256", name: "Critical Thinking", time: "14:00-15:20", room: "M4-0-011", type: "Lecture" },
    { code: "AGRL130", name: "Innovation & Sustainability", time: "16:00-18:50", room: "M4-0-011", type: "Lecture" }
  ],
  2: [ // Tuesday
    { code: "ASBL100", name: "Introductory Biology for Engineers", time: "10:00-10:50", room: "M2-2-007", type: "Lecture" },
    { code: "AENL226", name: "Power Electronics and Power Systems", time: "11:00-12:20", room: "M4-0-011", type: "Lecture" },
    { code: "AHUL261", name: "Introduction to Psychology", time: "14:00-15:20", room: "M4-0-011", type: "Lecture" },
    { code: "AHUL256", name: "Critical Thinking", time: "15:30-16:20", room: "M4-1-017", type: "Tutorial", batch: 2 },
    { code: "AENP225", name: "Electrical Energy Lab", time: "16:00-18:50", room: "M3-1-009", type: "Lab", batch: 1 }
  ],
  3: [ // Wednesday
    { code: "AENL228", name: "Measurement & Instrumentation", time: "08:00-08:50", room: "M2-2-007", type: "Lecture" },
    { code: "AENP200", name: "Energy Technology Lab", time: "09:00-11:50", room: "M3-1-009", type: "Lab", batch: 1 },
    { code: "AENL228", name: "Measurement Lab", time: "09:00-10:50", room: "M2-2-031", type: "Lab", batch: 2 },
    { code: "AHUL261", name: "Introduction to Psychology", time: "11:00-11:50", room: "M4-1-017", type: "Tutorial", batch: 2 },
    { code: "AHUL256", name: "Critical Thinking", time: "14:00-15:20", room: "M4-0-011", type: "Lecture" },
    { code: "AHUL261", name: "Introduction to Psychology", time: "15:30-16:20", room: "M4-1-017", type: "Tutorial", batch: 1 },
    { code: "AENP200", name: "Energy Technology Lab", time: "15:30-18:20", room: "M3-1-009", type: "Lab", batch: 2 },
    { code: "AHUL256", name: "Critical Thinking", time: "17:00-17:50", room: "M4-1-017", type: "Tutorial", batch: 1 }
  ],
  4: [ // Thursday
    { code: "AENL226", name: "Power Electronics and Power Systems", time: "09:00-09:50", room: "M2-2-007", type: "Tutorial" },
    { code: "ASBL100", name: "Introductory Biology for Engineers", time: "10:00-10:50", room: "M2-2-007", type: "Lecture" },
    { code: "AENL226", name: "Power Electronics and Power Systems", time: "11:00-12:20", room: "M4-0-011", type: "Lecture" },
    { code: "AHUL261", name: "Introduction to Psychology", time: "14:00-15:20", room: "M4-0-011", type: "Lecture" },
    { code: "AENL228", name: "Measurement Lab", time: "16:00-17:50", room: "M2-2-031", type: "Lab", batch: 1 },
    { code: "AENP225", name: "Electrical Energy Lab", time: "16:00-18:50", room: "M3-1-009", type: "Lab", batch: 2 }
  ],
  5: [ // Friday
    { code: "ASBL100", name: "Introductory Biology for Engineers", time: "08:00-08:50", room: "M2-2-007", type: "Lecture" },
    { code: "ASBL100", name: "Introductory Biology Lab", time: "10:00-11:50", room: "M3-1-031", type: "Lab" }
  ]
};

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

// Alias for safety
const timetableData = {
  1: WEEKLY_CLASSES[1], 2: WEEKLY_CLASSES[2], 3: WEEKLY_CLASSES[3], 4: WEEKLY_CLASSES[4], 5: WEEKLY_CLASSES[5],
  monday: WEEKLY_CLASSES[1], tuesday: WEEKLY_CLASSES[2], wednesday: WEEKLY_CLASSES[3], thursday: WEEKLY_CLASSES[4], friday: WEEKLY_CLASSES[5]
};

function updateLiveClassStatus() {
  const statusEl = document.getElementById("live-class-status");
  const dotEl = document.getElementById("live-class-dot");
  if (!statusEl) return;
  
  const savedBatch = Number(localStorage.getItem("student-batch") || "1");
  const now = new Date();
  const dayKey = now.getDay(); // 0: Sun, 1: Mon, ..., 6: Sat
  const currentMins = now.getHours() * 60 + now.getMinutes();

  if (dayKey === 0 || dayKey === 6) {
    statusEl.innerHTML = `
      <div class="tracker-hero-body">
        <div class="tracker-main-info">
          <div class="tracker-class-name">
            <span class="live-tag live-tag-free">WEEKEND</span>
            <strong>Campus Quiet · Rest Period</strong>
          </div>
          <div class="tracker-prof-line">No lectures scheduled today · Enjoy your weekend ✿</div>
        </div>
      </div>
    `;
    if (dotEl) dotEl.className = "live-class-dot dot-free";
    return;
  }

  const todayClasses = (WEEKLY_CLASSES[dayKey] || []).filter(c => {
    return c.batch === undefined || c.batch === savedBatch;
  });

  let currentClass = null;
  let nextClass = null;

  for (const c of todayClasses) {
    const [startStr, endStr] = c.time.split("-");
    const startMins = timeToMinutes(startStr.trim());
    const endMins = timeToMinutes(endStr.trim());
    
    if (currentMins >= startMins && currentMins < endMins) {
      currentClass = c;
    } else if (currentMins < startMins) {
      if (!nextClass || startMins < timeToMinutes(nextClass.time.split("-")[0].trim())) {
        nextClass = c;
      }
    }
  }

  // Lunch break check: between 12:00 and 14:00 (720 and 840 mins)
  if (!currentClass && currentMins >= 720 && currentMins < 840) {
    statusEl.innerHTML = `
      <div class="tracker-hero-body">
        <div class="tracker-main-info">
          <div class="tracker-class-name">
            <span class="live-tag live-tag-lunch">LUNCH BREAK</span>
            <strong>Campus Dining & Recess</strong>
          </div>
          <div class="tracker-prof-line">Midday break · 12:00 – 14:00</div>
        </div>
      </div>
      ${nextClass ? `
        <div class="tracker-next-banner">
          <span class="next-label">⏱ AFTERNOON SESSION AT ${nextClass.time.split("-")[0].trim()}:</span>
          <strong>${nextClass.code} ${nextClass.type}</strong>
          <span class="next-room">in ${roomShort(nextClass.room)}</span>
        </div>
      ` : ""}
    `;
    if (dotEl) dotEl.className = "live-class-dot dot-lunch";
    return;
  }
  
  if (currentClass) {
    const [, endStr] = currentClass.time.split("-");
    const endMins = timeToMinutes(endStr.trim());
    const minsLeft = endMins - currentMins;
    const timeLeftStr = minsLeft < 60 ? `${minsLeft} min` : `${Math.floor(minsLeft / 60)}h ${minsLeft % 60}m`;
    const fullTitle = (COURSE_TITLES && COURSE_TITLES[currentClass.code]) || currentClass.code;

    statusEl.innerHTML = `
      <div class="tracker-hero-body">
        <div class="tracker-main-info">
          <div class="tracker-class-name">
            <span class="live-tag live-tag-now">IN SESSION</span>
            <strong>${currentClass.code}</strong>
            <span class="tracker-type-badge">${currentClass.type}</span>
          </div>
          <div class="tracker-prof-line">${fullTitle}</div>
        </div>
        <div class="tracker-plates">
          <div class="tracker-plate tracker-plate-room">
            <span class="plate-label">ROOM</span>
            <span class="plate-val">${roomShort(currentClass.room)}</span>
          </div>
          <div class="tracker-plate tracker-plate-time">
            <span class="plate-label">ENDS IN</span>
            <span class="plate-val time-val">${timeLeftStr}</span>
          </div>
        </div>
      </div>
      ${nextClass ? `
        <div class="tracker-next-banner">
          <span class="next-label">⏱ UP NEXT AT ${nextClass.time.split("-")[0].trim()}:</span>
          <strong>${nextClass.code} ${nextClass.type}</strong>
          <span class="next-room">in ${roomShort(nextClass.room)}</span>
        </div>
      ` : ""}
    `;
    if (dotEl) dotEl.className = "live-class-dot dot-active";
  } else {
    // Free time
    if (nextClass) {
      const [startStr] = nextClass.time.split("-");
      const startMins = timeToMinutes(startStr.trim());
      const minsToStart = startMins - currentMins;
      const timeToStartStr = minsToStart < 60 ? `${minsToStart} min` : `${Math.floor(minsToStart / 60)}h ${minsToStart % 60}m`;
      const nextTitle = (COURSE_TITLES && COURSE_TITLES[nextClass.code]) || nextClass.code;

      statusEl.innerHTML = `
        <div class="tracker-hero-body">
          <div class="tracker-main-info">
            <div class="tracker-class-name">
              <span class="live-tag live-tag-free">FREE PERIOD</span>
              <strong>Open Study & Break Slot</strong>
            </div>
            <div class="tracker-prof-line">No lectures currently in progress</div>
          </div>
          <div class="tracker-plates">
            <div class="tracker-plate tracker-plate-next">
              <span class="plate-label">STARTS IN</span>
              <span class="plate-val time-val">${timeToStartStr}</span>
            </div>
          </div>
        </div>
        <div class="tracker-next-banner">
          <span class="next-label">⏱ UP NEXT AT ${nextClass.time.split("-")[0].trim()}:</span>
          <strong>${nextClass.code} ${nextClass.type}</strong> (${nextTitle})
          <span class="next-room">in ${roomShort(nextClass.room)}</span>
        </div>
      `;
      if (dotEl) dotEl.className = "live-class-dot dot-free";
    } else {
      statusEl.innerHTML = `
        <div class="tracker-hero-body">
          <div class="tracker-main-info">
            <div class="tracker-class-name">
              <span class="live-tag live-tag-done">DONE FOR TODAY</span>
              <strong>Classes Complete ✿</strong>
            </div>
            <div class="tracker-prof-line">All scheduled academic lectures for today are finished</div>
          </div>
        </div>
      `;
      if (dotEl) dotEl.className = "live-class-dot dot-free";
    }
  }
}

let activeTimetableTab = null;

function renderModalTimetable(dayKey) {
  const container = document.getElementById("modal-timetable-list");
  if (!container) return;
  
  // Determine which day to render
  if (dayKey === undefined) {
    if (activeTimetableTab === null) {
      const today = new Date().getDay();
      activeTimetableTab = (today >= 1 && today <= 5) ? today : 1;
    }
    dayKey = activeTimetableTab;
  } else {
    activeTimetableTab = dayKey;
  }
  
  // Highlight active tab
  const tabBtns = document.querySelectorAll(".modal-tab-btn");
  tabBtns.forEach(btn => {
    btn.classList.toggle("active", Number(btn.dataset.dayTab) === dayKey);
  });
  
  const currentBatch = Number(localStorage.getItem("student-batch") || "1");
  const dayClasses = WEEKLY_CLASSES[dayKey] || [];
  
  // Sort chronologically
  const sortedClasses = [...dayClasses].sort((a, b) => {
    return timeToMinutes(a.time.split("-")[0].trim()) - timeToMinutes(b.time.split("-")[0].trim());
  });
  
  if (sortedClasses.length === 0) {
    container.innerHTML = `<p style="text-align:center; font-size:0.85rem; color:var(--text-muted); padding: 24px 0;">🌴 No classes scheduled for this day!</p>`;
    return;
  }
  
  let insertedDivider = false;
  
  const rowsHtml = [];
  sortedClasses.forEach(c => {
    const isSplit = c.batch !== undefined;
    const isActiveBatch = !isSplit || c.batch === currentBatch;
    const itemClass = isSplit
      ? (isActiveBatch ? "timeline-row batch-active" : "timeline-row batch-inactive")
      : "timeline-row";
      
    const borderClr = COURSE_COLORS[c.code] || "var(--text-muted)";
    const batchLabel = isSplit ? ` · Group ${c.batch}` : "";
    
    const startTimeMins = timeToMinutes(c.time.split("-")[0].trim());
    
    if (!insertedDivider && startTimeMins >= 840) {
      rowsHtml.push(`
        <div class="afternoon-divider">
          <span>✿ Afternoon Sessions</span>
        </div>
      `);
      insertedDivider = true;
    }
    
    rowsHtml.push(`
      <div class="${itemClass}" style="border-left-color: ${borderClr};">
        <div class="timeline-time">⏱️ ${c.time}</div>
        <div class="timeline-meta">
          <div class="timeline-code-row">
            <span class="timeline-code">${c.code}</span>
            <span class="timeline-type">${c.type}</span>
          </div>
          <div class="timeline-room">📍 ${roomLabel(c.room)}${batchLabel}</div>
        </div>
        <div class="timeline-name">${c.name}</div>
      </div>
    `);
  });

  container.innerHTML = rowsHtml.join("");
}

// Academic Deadlines & Quizzes
addUpdate("assignments", "AENP200: Complete Bomb Calorimeter Lab Report (Energy Transition Lab), 09/09/2026", "2026-09-09");
addUpdate("quizzes", "AHUL261: Psychology Quiz (during class 14:00), 08/09/2026", "2026-09-08");

// ================= INIT =================
window.addEventListener("DOMContentLoaded", () => {
  console.log("--- SCRIPTS.JS FORCE LOAD V14 ---");
  renderGeneralLinks(".general", linksData.general);
  renderCourseLinks(".links", linksData.courses);
  renderUpdates();
  renderLocalClips();
  wireInteractiveReels();
  buildHeroSub();
  updateLiveClassStatus();
  setInterval(updateLiveClassStatus, 15000);
  if (typeof initMascot === "function") initMascot();

  // Batch toggle buttons (main bar and modal)
  const batchBtns = document.querySelectorAll(".batch-btn");
  const modalBatchBtns = document.querySelectorAll(".modal-batch-btn");
  const savedBatch = localStorage.getItem("student-batch") || "1";
  
  function applyBatch(b) {
    localStorage.setItem("student-batch", b);
    batchBtns.forEach(x => x.classList.toggle("on", x.dataset.batch === b));
    modalBatchBtns.forEach(x => x.classList.toggle("on", x.dataset.batch === b));
    updateLiveClassStatus();
    renderModalTimetable(activeTimetableTab);
  }

  batchBtns.forEach(btn => {
    btn.classList.toggle("on", btn.dataset.batch === savedBatch);
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      applyBatch(btn.dataset.batch);
    });
  });

  modalBatchBtns.forEach(btn => {
    btn.classList.toggle("on", btn.dataset.batch === savedBatch);
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      applyBatch(btn.dataset.batch);
    });
  });

  // Modal Tab Bar buttons
  const modalTabBtns = document.querySelectorAll(".modal-tab-btn");
  modalTabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const d = Number(btn.dataset.dayTab);
      renderModalTimetable(d);
    });
  });

  // Timetable Modal logic
  const openTimeBtn = document.getElementById("timetable-box");
  const calBtn = document.querySelector(".tracker-calendar-btn");
  const timeModal = document.getElementById("timetable-modal");
  const closeTimeBtn = document.getElementById("close-timetable-modal");
  
  function openTimetableModal(e) {
    if (e && e.target && (e.target.closest(".batch-btn") || e.target.closest(".batch-toggle-container"))) {
      return;
    }
    renderModalTimetable();
    if (timeModal) {
      timeModal.style.display = "block";
      document.body.style.overflow = "hidden";
    }
  }

  function closeTimetableModal() {
    if (timeModal) {
      timeModal.style.display = "none";
      document.body.style.overflow = "";
    }
  }

  
  // Wire timetable links
  document.querySelectorAll('a[href="timetable.pdf"]').forEach(link => {
    link.addEventListener("click", (e) => {
      if (link.classList.contains("tt-pdf-btn")) return; // Let in-modal download button open PDF
      e.preventDefault();
      openTimetableModal(e);
    });
  });

  if (openTimeBtn) openTimeBtn.addEventListener("click", openTimetableModal);
  if (calBtn) calBtn.addEventListener("click", openTimetableModal);

  if (closeTimeBtn && timeModal) {
    closeTimeBtn.addEventListener("click", closeTimetableModal);
  }

  window.addEventListener("click", (event) => {
    if (event.target === timeModal) {
      closeTimetableModal();
    }
  });

  // Keyboard shortcut: Escape closes active modals
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeTimetableModal();
      const gModal = document.getElementById("games-modal");
      if (gModal) gModal.style.display = "none";
    }
  });
});
