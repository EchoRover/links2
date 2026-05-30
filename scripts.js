// ============================================================
// scripts.js — INDEX page only.
// Shared helpers live in shared.js
// ============================================================

const linksData = {
  general: {
    ERP: "https://iitdadierp.iitd.ac.in/student/login",
    Teams: "https://teams.microsoft.com/",
    Outlook: "https://outlook.office.com/",
    Blackboard: "https://iida.blackboard.com/ultra/course",
    TimeTable: "https://iitdabudhabi.ac.ae/",
    linkCS: {
      url: "https://linkcs.vercel.app",
      className: "cs-link",
      quip: "the other side of town ↗",
      quipTop: "you and i are polar opposites"
    }
  },
  courses: {
    "AENL226 (Power Electronics)": { credits: 4,   ltp: "3-1-0", links: {} },
    "AENL228 (Measurement & Instr)": { credits: 3,   ltp: "2-0-2", links: {} },
    "AENP200 (Energy Tech Lab)":     { credits: 1.5, ltp: "0-0-3", links: {} },
    "AENP225 (Elec Energy Lab)":     { credits: 1.5, ltp: "0-0-3", links: {} },
    "AHUL256 (Critical Thinking)":   { credits: 4,   ltp: "3-1-0", links: {} },
    "AHUL261 (Intro to Psychology)": { credits: 4,   ltp: "3-1-0", links: {} },
    "ASBL100 (Intro Biology)":       { credits: 4,   ltp: "3-0-2", links: {} }
  }
};

const updatesData = [];
const localClips = Array.from({ length: 16 }, (_, i) => `idk${i + 1}.mp4`);

function pickRandomClips(count) {
  const pool = [...localClips];
  const result = [];
  for (let i = 0; i < count && pool.length; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}

function renderLocalClips() {
  const leftVid = document.getElementById("local-clip-left");
  const rightVid = document.getElementById("local-clip-right");
  if (!leftVid || !rightVid || localClips.length === 0) return;
  const [leftSrc, rightSrc] = pickRandomClips(2);
  [leftVid, rightVid].forEach((vid, idx) => {
    vid.src = idx === 0 ? leftSrc : rightSrc;
    vid.muted = true;
    vid.playsInline = true;
    vid.loop = true;
    vid.autoplay = true;
    vid.load();
    vid.play().catch(() => {});
  });
}

function addUpdate(category, text, expiry) { updatesData.push([category, text, expiry]); }

function renderUpdates() {
  const now = new Date();
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
      const expiryExclusive = new Date(y, m - 1, d + 1);
      if (now < expiryExclusive) {
        const p = document.createElement("p");
        p.textContent = text;
        container.appendChild(p);
      }
    });
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

// ================= INIT =================
window.addEventListener("DOMContentLoaded", () => {
  console.log("--- SCRIPTS.JS FORCE LOAD V11 ---");
  renderGeneralLinks(".general", linksData.general);
  renderCourseLinks(".links", linksData.courses);
  renderUpdates();
  renderLocalClips();
  buildHeroSub();
  if (typeof initMascot === "function") initMascot();
});
