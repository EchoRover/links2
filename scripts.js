// ============================================================
// SEM 5 (Year 3 Sem 1) — Aug 2026 onward · ACTIVE
// URLs added as courses come online for Energy Engineering.
// ============================================================
const linksData = {
  general: {
    ERP: "https://iitdadierp.iitd.ac.in/student/login",
    Teams: "https://teams.microsoft.com/",
    Outlook: "https://outlook.office.com/",
    Blackboard: "https://iida.blackboard.com/ultra/course",
    Website: "https://iitdabudhabi.ac.ae/",
    Faculty: "https://iitdabudhabi.ac.ae/faculty",
    Bus: "bus.html",
    "Acd Cal": "https://iitdabudhabi.ac.ae/uploaded_files/AcademicCalendar-2026-27Sem1.pdf",
    TimeTable: "timetable.pdf",
  },

  courses: {
    "AENL226 (Power Electronics & Systems)": {
      Blackboard: "https://iida.blackboard.com/ultra/courses/_162_1/outline",
    },
    "AENL228 (Measurement & Instrumentation)": {
      Blackboard: "https://iida.blackboard.com/ultra/courses/_163_1/outline",
    },
    "AENP200 (Energy Technology Lab)": {
      Blackboard: "https://iida.blackboard.com/ultra/courses/_164_1/outline",
    },
    "AENP225 (Electrical Energy Lab)": {
      Blackboard: "https://iida.blackboard.com/ultra/courses/_165_1/outline",
    },
    "AHUL256 (Critical Thinking)": {
      Blackboard: "https://iida.blackboard.com/ultra/courses/_182_1/outline",
    },
    "AHUL261 (Psychology)": {
      Blackboard: "https://iida.blackboard.com/ultra/courses/_183_1/outline",
    },
    "ASBL100 (Introductory Biology)": {
      Blackboard: "https://iida.blackboard.com/ultra/courses/_190_1/outline",
    },
    "AGRL130 (Entrepreneurship & Sustainability)": {
      Blackboard: "https://iida.blackboard.com/ultra/courses/_179_1/outline",
    },
  },
};

// Per-course metadata. Each course gets editorial treatment:
// title (short display), subtitle (descriptive tagline), dept, credits, LTP.
const COURSE_META = {
  AENL226: {
    title: "Power Electronics & Systems",
    subtitle: "Conversion, Control & Modern Grid Networks",
    dept: "ENERGY ENG.",
    credits: 4,
    ltp: "3-1-0",
  },
  AENL228: {
    title: "Measurement & Instrumentation",
    subtitle: "Sensors, Signal Conditioning & Energy Systems",
    dept: "ENERGY ENG.",
    credits: 3,
    ltp: "2-0-2",
  },
  AENP200: {
    title: "Energy Technology Lab",
    subtitle: "Experimental Thermal, Solar & Renewable Rigs",
    dept: "ENERGY ENG.",
    credits: 1.5,
    ltp: "0-0-3",
  },
  AENP225: {
    title: "Electrical Energy Lab",
    subtitle: "Machines, Drives & Power Electronics Practice",
    dept: "ENERGY ENG.",
    credits: 1.5,
    ltp: "0-0-3",
  },
  AHUL256: {
    title: "Critical Thinking",
    subtitle: "Arguments, Reasoning & Sound Inference",
    dept: "HUMANITIES",
    credits: 4,
    ltp: "3-1-0",
  },
  AHUL261: {
    title: "Psychology",
    subtitle: "Cognition, Behavior & The Human Mind",
    dept: "HUMANITIES",
    credits: 4,
    ltp: "3-1-0",
  },
  ASBL100: {
    title: "Introductory Biology",
    subtitle: "Cellular Machinery, Genetics & Bioengineering",
    dept: "BIO. SCI.",
    credits: 4,
    ltp: "3-0-2",
  },
  AGRL130: {
    title: "Entrepreneurship & Sustainability",
    subtitle: "Innovation, Ventures & Sustainable Practice",
    dept: "GEN. ELEC.",
    credits: 3,
    ltp: "3-0-0",
  },
};

function renderLinks1(thing, data) {
  const container = document.querySelector(thing);
  if (!container) return;

  for (const [course, resources] of Object.entries(data)) {
    const match = course.match(/^(\S+)(?:\s*\((.+)\))?$/);
    const code = match ? match[1] : course;
    const prefix = code.slice(0, 4).toUpperCase();
    const meta = COURSE_META[code] || {};
    const title = meta.title || (match && match[2]) || course;
    const subtitle = meta.subtitle || "";
    const dept = meta.dept || "";

    const box = document.createElement("article");
    box.className = "box";
    box.dataset.prefix = prefix;

    const h1 = document.createElement("h1");
    h1.className = "course-h1-sr";
    h1.textContent = `${code} — ${title}`;
    box.appendChild(h1);

    // Editorial course header — code chip, dept label, drop-cap title, subtitle
    const firstLetter = title.charAt(0);
    const restOfTitle = title.slice(1);
    const header = document.createElement("div");
    header.className = "course-header";
    header.innerHTML = `
      <div class="course-top">
        <span class="course-chip">${code}</span>
        <span class="course-meta-inline">
          ${meta.ltp ? `<span class="course-ltp">${meta.ltp}</span>` : ""}
          ${meta.credits ? `<span class="course-credits">${meta.credits}</span>` : ""}
        </span>
      </div>
      <h2 class="course-name"><span class="course-firstletter">${firstLetter}</span>${restOfTitle}</h2>
    `;
    box.appendChild(header);

    const linksGrid = document.createElement("div");
    linksGrid.className = "course-links";
    for (const [n, url] of Object.entries(resources)) {
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.innerHTML = `<span class="link-bullet"></span><span class="link-label">${n}</span><svg class="link-arrow" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      linksGrid.appendChild(link);
    }
    box.appendChild(linksGrid);

    container.appendChild(box);
  }
}

// ====== Updates Data ======
const updatesData = [];

function addUpdate(category, text, expiry) {
  updatesData.push([category, text, expiry]);
}

// Rich update rendering: each item gets a date box (day-of-week · DD MMM)
// + course code + event text.
function renderUpdates() {
  const now = new Date();
  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const grouped = {};
  updatesData.forEach(([category, text, expiry]) => {
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push([text, expiry]);
  });

  for (const [category, items] of Object.entries(grouped)) {
    items.sort((a, b) => new Date(a[1]) - new Date(b[1]));
    const container = document.getElementById(category + "-box");
    if (!container) continue;

    items.forEach(([text, expiry]) => {
      const parts = String(expiry).split("-").map(Number);
      if (parts.length !== 3) return;
      const [y, m, d] = parts;
      const expiryExclusive = new Date(y, m - 1, d + 1, 0, 0, 0, 0);
      if (now >= expiryExclusive) return;

      const dateObj = new Date(y, m - 1, d);
      const dow = DOW[dateObj.getDay()];
      const mon = MON[dateObj.getMonth()];

      // Parse "CODE: event, DD/MM/YYYY" → { code, event }
      const lastComma = text.lastIndexOf(",");
      const head = lastComma >= 0 ? text.slice(0, lastComma) : text;
      const colon = head.indexOf(":");
      const code = colon >= 0 ? head.slice(0, colon).trim() : "";
      const event = colon >= 0 ? head.slice(colon + 1).trim() : head.trim();

      const row = document.createElement("div");
      row.className = "upd-row";

      const dateBox = document.createElement("div");
      dateBox.className = "upd-date";
      dateBox.innerHTML = `
        <span class="upd-dow">${dow}</span>
        <span class="upd-day">${String(d).padStart(2, "0")}</span>
        <span class="upd-mon">${mon}</span>
      `;
      row.appendChild(dateBox);

      const body = document.createElement("div");
      body.className = "upd-body";
      if (code) {
        const codeEl = document.createElement("span");
        codeEl.className = "upd-code";
        codeEl.textContent = code;
        body.appendChild(codeEl);
      }
      const eventEl = document.createElement("span");
      eventEl.className = "upd-event";
      eventEl.textContent = event;
      body.appendChild(eventEl);
      row.appendChild(body);

      container.appendChild(row);
    });
  }
}

const toggleBtn = document.getElementById("theme-toggle");

// Initialize theme from system preference or stored
const currentTheme = localStorage.getItem("theme");
if (currentTheme) {
  document.documentElement.setAttribute("data-theme", currentTheme);
}

if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    const theme = document.documentElement.getAttribute("data-theme");
    const newTheme = theme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  });
}

// Sample initial updates / calendar markers
addUpdate("quizzes", "Mid-sem exams begin, 26/10/2026", "2026-10-26");
addUpdate("assignments", "AGRL130: Project Proposal, 30/09/2026", "2026-09-30");

window.addEventListener("DOMContentLoaded", () => {
  renderLinks1("#course-grid", linksData.courses);
  renderUpdates();
});
