// ====== Links Data ======
const linksData = {
  general: {
    ERP: "https://iitdadierp.iitd.ac.in/student/login",
    Teams: "https://teams.microsoft.com/",
    Outlook: "https://outlook.office.com/",
    Blackboard: "https://iida.blackboard.com/ultra/course",
    TimeTable: "https://abudhabi.iitd.ac.in/uploaded_files/B.Tech.%202nd%20year%20EEN%20Sem%201_2025-26.pdf"
  },
  courses: {
    "AENL220 (Heat)": {
      "Lecture slides": "https://iitdabudhabi.sharepoint.com/sites/AENL220_jacpcl/Class%20Materials/Forms/AllItems.aspx",
      Quiz: "https://iitdabudhabi.sharepoint.com/:f:/s/AENL220_jacpcl/Ene8Rq62J5JEonz9fQsD5BUBIJLmyXtU-onfgvHZgCNK4g?e=T6SezX",
      Tutorials: "https://iitdabudhabi.sharepoint.com/:f:/s/AENL220_jacpcl/EtURNCymC25FqStyIHHQjH8BzKEl9InbYIHEWA3reHm2CQ?e=w8iQBg"
    },
    "AAPL105 (Mech)": {
      Blackboard: "https://iida.blackboard.com/ultra/courses/_38_1/outline"
    },
    "AENL210 (Thermo)": {
      Blackboard : "https://iida.blackboard.com/ultra/courses/_39_1/outline",
      Lectures: "https://iitdabudhabi-my.sharepoint.com/:f:/g/personal/kkant_iitdabudhabi_ac_ae/Enl1qAazZR9BiFn9yuRHZl4Be2lylwrBb1NKZ_ew9EDn7Q?e=JzixUb",
      "Assig/Quiz/Tut": "https://iitdabudhabi-my.sharepoint.com/:f:/g/personal/kkant_iitdabudhabi_ac_ae/EmyiV-znPk9NtH9FoIu7GREBj0c8bxilcB5rOI_EQgTnkA?e=MfniI6",
      "Assig/Quiz/Tut (Solution)": "https://iitdabudhabi-my.sharepoint.com/:f:/g/personal/kkant_iitdabudhabi_ac_ae/Es8ZXG4JDGJBl8iwEl7fmHwBu-cJIzobmNyaq4GFLzK5NQ?e=IBLE0E"
    },
    "AENL222 (Electro & Micro)": {
      Onedrive: "https://iitdabudhabi-my.sharepoint.com/personal/anandarup_iitdabudhabi_ac_ae/_layouts/15/onedrive.aspx?id=/personal/anandarup_iitdabudhabi_ac_ae/Documents/AENL222_for_sharing&ga=1",
      "Lectures (Slides)": "https://iitdabudhabi-my.sharepoint.com/:f:/r/personal/anandarup_iitdabudhabi_ac_ae/Documents/AENL222_for_sharing/lecture_slides?csf=1&web=1&e=mHx3jp",
      "Lectures (Vids)": "https://iitdabudhabi-my.sharepoint.com/:f:/r/personal/anandarup_iitdabudhabi_ac_ae/Documents/AENL222_for_sharing/lecture_videos?csf=1&web=1&e=hZFX1z",
      "Problem Sheets": "https://iitdabudhabi-my.sharepoint.com/:f:/r/personal/anandarup_iitdabudhabi_ac_ae/Documents/AENL222_for_sharing/problem_sheet?csf=1&web=1&e=1TktU9"
    },
    "AENL338 (AI)": {
      Blackboard: "https://iida.blackboard.com/ultra/courses/_6_1/outline"
    }
  }
};

// ====== Updates Data ======
const updatesData = [];

// ====== Helper to Add Update ======
function addUpdate(category, text, expiry) {
  updatesData.push([category, text, expiry]);
}

// ====== Render General Links ======
function renderGeneralLinks(selector, data) {
  const container = document.querySelector(selector);
  if (!container) return;
  for (const [name, url] of Object.entries(data)) {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.textContent = name;
    container.appendChild(link);
  }
}

// ====== Render Course Links ======
function renderCourseLinks(selector, data) {
  const container = document.querySelector(selector);
  if (!container) return;
  for (const [course, resources] of Object.entries(data)) {
    const box = document.createElement("div");
    box.className = "box";

    const title = document.createElement("h1");
    title.textContent = course;
    box.appendChild(title);

    for (const [name, url] of Object.entries(resources)) {
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.textContent = name;
      box.appendChild(link);
    }
    container.appendChild(box);
  }
}

// ====== Render Updates ======
function renderUpdates() {
  const now = new Date();
  now.setSeconds(0, 0);

  updatesData.forEach(([category, text, expiry]) => {
    const expiryDate = new Date(expiry);
    expiryDate.setHours(0, 0, 0, 0); // expires exactly at midnight

    if (now < expiryDate) {
      const container = document.getElementById(category + "-box");
      if (container) {
        const p = document.createElement("p");
        p.textContent = text;
        container.appendChild(p);
      }
    }
  });
}

// ====== Theme Toggle ======
const toggleBtn = document.getElementById("theme-toggle");
const currentTheme = localStorage.getItem("theme");
if (currentTheme) document.documentElement.setAttribute("data-theme", currentTheme);

toggleBtn.addEventListener("click", () => {
  const theme = document.documentElement.getAttribute("data-theme");
  const newTheme = theme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
});


//Updates:


addUpdate("assignments","AENL210: Tutorial submission on Monday, 22/09/2025","2025-09-22")
addUpdate("timetable","Online classes will be held on Sunday 21/09/2025 following the Wednesday timetable","2025-09-21")

addUpdate("timetable","AAPL105: No class on Sunday, instead a physical class from 3-4 PM on Monday, 22/09/2025","2025-09-22")
addUpdate("assignments","AAPL105: Submission of Assignment for chapter 3 is on 24/09/2025, questions uploaded on blackboard","2025-09-24")
addUpdate("timetable","AENL220: Buffer class will be taken on 24/09/2025 from 12:30 in classroom 5","2025-09-24")



addUpdate("assignments","AENL210: Tutorial 5 submission on Thursday, 25/09/2025","2025-09-25")
addUpdate("quizzes","AENL210: Quiz 5 on Wednesday, 01/10/2025 at 12:30 PM","2025-10-01")
addUpdate("quizzes","AAPL105: Quiz 2 based on Homework 3 and 4 will be on 29/09/2025, 3-4 PM","2025-09-29")

// ====== Initialize Page ======
window.addEventListener("DOMContentLoaded", () => {
  renderGeneralLinks(".general", linksData.general);
  renderCourseLinks(".links", linksData.courses);
  renderUpdates();
});
