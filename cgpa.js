// ============================================================
// cgpa.js — Logic for IIT Delhi CGPA Calculator
// ============================================================

const GRADE_POINTS = {
  "A": 10, "A-": 9, "B": 8, "B-": 7, "C": 6, "C-": 5, "D": 4, "E": 2, "F": 0
};

const PREPOPULATED_COURSES = {
  "Semester 1": [
    { name: "Calculus (AMTL100)", credits: 4, grade: "A" },
    { name: "Intro to Chemistry (ACML101)", credits: 4, grade: "A" },
    { name: "Chemistry Lab (ACMP100)", credits: 2, grade: "A" },
    { name: "Foundation of Academic Success (AGRL100)", credits: 1, grade: "A" },
    { name: "Comm. in Eng/Sci/Tech (AGRL110)", credits: 2, grade: "A" },
    { name: "Intro to CS (ACOL100)", credits: 4, grade: "A" }
  ],
  "Semester 2": [
    { name: "Linear Algebra & Diff Eq (AMTL101)", credits: 4, grade: "A" },
    { name: "EM & Quantum Mech (APYL101)", credits: 4, grade: "A" },
    { name: "Physics Lab (APYP100)", credits: 2, grade: "A" },
    { name: "Intro to Elec Eng (AELL101)", credits: 4, grade: "A" },
    { name: "Elec Eng Lab (AELP101)", credits: 1, grade: "A" },
    { name: "Intro to Energy Eng (AENL100)", credits: 2, grade: "A" }
  ],
  "Semester 3": [
    { name: "Heat Transfer (AENL220)", credits: 4, grade: "A" },
    { name: "Mech of Solids & Fluids (AAPL105)", credits: 4, grade: "A" },
    { name: "Thermodynamics (AENL210)", credits: 4, grade: "A" },
    { name: "Basic Elec & Microcontrollers (AENL222)", credits: 3, grade: "A" },
    { name: "AI for Energy Transition (AENL338)", credits: 3, grade: "A" }
  ],
  "Semester 4": [
    { name: "Conv. Energy Tech (AENL200)", credits: 4, grade: "A" },
    { name: "Materials for Energy Sys (AENL223)", credits: 4, grade: "A" },
    { name: "Renewable Energy Tech (AENL202)", credits: 4, grade: "A" },
    { name: "Electrical Machines (AENL224)", credits: 3, grade: "A" },
    { name: "HUL Elective: Macroeconomics (AHUL213)", credits: 4, grade: "A" },
    { name: "HUL Elective: Literature", credits: 4, grade: "A" },
    { name: "Open Elective: Data Science", credits: 4, grade: "A" }
  ],
  "Semester 5": [
    { name: "Power Electronics (AENL226)", credits: 4, grade: "A" },
    { name: "Measurement & Instr (AENL228)", credits: 3, grade: "A" },
    { name: "Energy Tech Lab (AENP200)", credits: 1.5, grade: "A" },
    { name: "Elec Energy Lab (AENP225)", credits: 1.5, grade: "A" },
    { name: "Intro Biology (ASBL100)", credits: 4, grade: "A" },
    { name: "HUL Elective: Critical Thinking (AHUL256)", credits: 4, grade: "A" },
    { name: "HUL Elective: Psychology (AHUL261)", credits: 4, grade: "A" },
    { name: "Open Elective: Artificial Intelligence", credits: 4, grade: "A" }
  ]
};

let semesters = [];
let studentId = "";

// Student Name Mapping
const STUDENT_NAMES = {
  "24A1EENB0000": "Admin",
  "24A1CSEB0001": "Abhiramachandra Vemparala",
  "24A1CSEB0002": "Aditya Murugesh",
  "24A1CSEB0003": "Aditya Mohan",
  "24A1CSEB0004": "Ahad Abdullah Alghamri",
  "24A1CSEB0005": "Ayachi Mishra",
  "24A1CSEB0006": "Chaudhary Parva Tejas",
  "24A1CSEB0007": "Ehsan Mohamed K",
  "24A1CSEB0008": "Evan Johan Tobias",
  "24A1CSEB0009": "Farhan Faizy",
  "24A1CSEB0010": "Hamad Mohammed",
  "24A1CSEB0011": "Himanshu Nayan Rathi",
  "24A1CSEB0012": "James Joshua Koshy",
  "24A1CSEB0013": "Joel Jobi",
  "24A1CSEB0014": "Kannapu Sujeeth Kevin",
  "24A1CSEB0015": "Karthik Nambiar Puthiyedathu Ve",
  "24A1CSEB0016": "Latifa Almarzooqi",
  "24A1CSEB0017": "Paul Tiju",
  "24A1CSEB0018": "Rawaan Alhammadi",
  "24A1CSEB0019": "Saket Sharma",
  "24A1CSEB0021": "Syeda Eshal Ilhan Daimi",
  "24A1CSEB0022": "Tanvi Parsam",
  "24A1CSEB0023": "Varanasi Sumant",
  "24A1CSEB0024": "Vipulav Batra",
  "24A1EENB0052": "Aryan Kumar Jha",
  "24A1EENB0053": "Divyesh Agarwal",
  "24A1EENB0054": "Fatima Alraeesi",
  "24A1EENB0055": "Gundala Shailendra Bhaskar Kira",
  "24A1EENB0056": "Hoor Alhammadi",
  "24A1EENB0058": "Kartik Swami",
  "24A1EENB0059": "Keshvi Singh",
  "24A1EENB0060": "Krishna Chandra Singh",
  "24A1EENB0061": "Kushal Rajendra Borugadda",
  "24A1EENB0062": "Lokesh Tiwari",
  "24A1EENB0064": "Mohammad Taqi Ahsan",
  "24A1EENB0065": "Mohsin Khan",
  "24A1EENB0066": "Noora Hamad Alrashdi",
  "24A1EENB0067": "R Lawmsanga",
  "24A1EENB0069": "Rindani Naman Shreyas",
  "24A1EENB0070": "Sarvesh Sarvanan",
  "24A1EENB0071": "Shama Alshehhi",
  "24A1EENB0072": "Sunaina Reji Baker",
  "24A1EENB0073": "Swara Amar Kotnis",
  "24A1EENB0074": "Tanisha Senthilraj",
  "24A1EENB0075": "Tarunika Ravikumar",
  "24A1EENB0077": "Sumedh Jamsandekar",
  "24A1EENB0078": "Abhimanyu Prakash",
  "24A1EENB0079": "Noura Mohsin",
  "24A1EENB0080": "Aaron Amacadu",
  "24A1EENB0081": "Sumayya Shakir Syed",
  "24A1EENB0082": "Mahra Abdulaziz Aldhaheri"
};

async function init() {
  const savedId = localStorage.getItem("student-id");
  if (savedId) {
    document.getElementById("student-id").value = savedId;
    validateAndUnlock(false); 
  }
}

function triggerMonkeyMode() {
  const bg = document.getElementById("bg");
  if (!bg) return;
  bg.innerHTML = ""; // Clear existing botanicals
  for (let i = 0; i < 25; i++) {
    const monkey = document.createElement("span");
    monkey.className = "leaf";
    monkey.textContent = Math.random() > 0.5 ? "🐒" : "🦍";
    monkey.style.fontSize = "3rem";
    monkey.style.lineHeight = "1";
    monkey.style.display = "block";
    
    const dur = 10 + Math.random() * 15;
    monkey.style.setProperty("--x", (Math.random() * 100).toFixed(2) + "vw");
    monkey.style.setProperty("--sz", "50px"); // needed for the animation transform origin
    monkey.style.setProperty("--drift", (Math.random() * 120 - 60).toFixed(0) + "px");
    monkey.style.setProperty("--spin", (Math.random() * 720 - 360).toFixed(0) + "deg");
    monkey.style.animationDuration = dur.toFixed(1) + "s";
    monkey.style.animationDelay = (-Math.random() * dur).toFixed(1) + "s";
    bg.appendChild(monkey);
  }
}

function validateAndUnlock(isManual = true) {
  const inputEl = document.getElementById("student-id");
  const input = inputEl.value.trim().toUpperCase();
  const status = document.getElementById("sync-status");
  
  if (!input) return;

  // STRICT VALIDATION: ID must exist in our registry
  if (!STUDENT_NAMES.hasOwnProperty(input)) {
    status.textContent = "Unauthorized ID";
    status.style.color = "#ff5555";
    document.getElementById("semesters-list").style.display = "none";
    document.getElementById("add-sem-container").style.display = "none";
    return;
  }

  const studentName = STUDENT_NAMES[input];

  // Easter Egg Check
  const monkeyIDs = ["24A1CSEB0008", "24A1CSEB0012", "24A1EENB0080"];
  const isMonkey = monkeyIDs.includes(input);
  const greetingName = isMonkey ? `${studentName} you monkey 🐒` : studentName;

  if (isMonkey && isManual) {
    triggerMonkeyMode();
  }

  // Check for valid CSE ID (Redirects)
  if (input.startsWith("24A1CSEB")) {
    status.textContent = `Hi ${greetingName}! Redirecting you to LinkCS...`;
    status.style.color = "var(--accent)";
    setTimeout(() => {
      window.location.href = "https://linkcs.vercel.app";
    }, 1200);
    return;
  }

  // Check for valid Energy (EEN) ID
  if (input.startsWith("24A1EENB")) {
    studentId = input;
    localStorage.setItem("student-id", studentId);
    
    status.textContent = `Hi ${greetingName}! Access Granted. Loading local data...`;
    status.style.color = "var(--accent)";
    
    document.getElementById("semesters-list").style.display = "grid";
    document.getElementById("add-sem-container").style.display = "block";
    loadData();
    return;
  }

  status.textContent = "Invalid ID Format";
  status.style.color = "#ff5555";
}

function loadData() {
  const local = localStorage.getItem(`data-${studentId}`);
  if (local) {
    let loadedSemesters = JSON.parse(local);
    
    // MIGRATION: Split combined Sem 4 elective row if it exists
    if (loadedSemesters[3] && loadedSemesters[3].name === "Semester 4") {
      const combinedIdx = loadedSemesters[3].courses.findIndex(c => c.name.includes("Macro/Lit/DS"));
      if (combinedIdx !== -1) {
        const grade = loadedSemesters[3].courses[combinedIdx].grade;
        loadedSemesters[3].courses.splice(combinedIdx, 1, 
          { name: "HUL Elective: Macroeconomics (AHUL213)", credits: 4, grade: grade },
          { name: "HUL Elective: Literature", credits: 4, grade: grade },
          { name: "Open Elective: Data Science", credits: 4, grade: grade }
        );
      }
    }
    
    // Prevent messed up data where user deleted a semester: rebuild fresh 5 semesters (min) and copy over existing courses by matching index
    semesters = [];
    const count = Math.max(5, loadedSemesters.length);
    for (let i = 0; i < count; i++) {
      const semNum = i + 1;
      const semName = `Semester ${semNum}`;
      // Load from saved if it matches the current index, otherwise prepopulate
      if (loadedSemesters[i]) {
        let semToKeep = loadedSemesters[i];
        semToKeep.name = semName;
        semesters.push(semToKeep);
      } else {
        const courses = PREPOPULATED_COURSES[semName] 
          ? JSON.parse(JSON.stringify(PREPOPULATED_COURSES[semName]))
          : [{ name: "", credits: "", grade: "A" }];
        semesters.push({ name: semName, courses: courses });
      }
    }
  } else {
    semesters = [];
    for (let i = 0; i < 5; i++) {
      const semNum = i + 1;
      const semName = `Semester ${semNum}`;
      const courses = PREPOPULATED_COURSES[semName] 
        ? JSON.parse(JSON.stringify(PREPOPULATED_COURSES[semName]))
        : [{ name: "", credits: "", grade: "A" }];
      semesters.push({ name: semName, courses: courses });
    }
  }
  
  // FIX for user who already shifted Sem 5 to Sem 1:
  // We can detect this by checking if Semester 1 has "Power Electronics"
  if (semesters[0] && semesters[0].courses.some(c => c.name.includes("Power Electronics"))) {
    // If we detect the bug, nuke the bad local data and generate a fresh 5 semesters
    semesters = [];
    for (let i = 0; i < 5; i++) {
      const semNum = i + 1;
      const semName = `Semester ${semNum}`;
      const courses = PREPOPULATED_COURSES[semName] 
        ? JSON.parse(JSON.stringify(PREPOPULATED_COURSES[semName]))
        : [{ name: "", credits: "", grade: "A" }];
      semesters.push({ name: semName, courses: courses });
    }
  }
  
  render();
}

function saveData() {
  if (!studentId) return;
  localStorage.setItem(`data-${studentId}`, JSON.stringify(semesters));
}

function addSemester() {
  const nextSemNum = semesters.length + 1;
  const semName = `Semester ${nextSemNum}`;
  semesters.push({ name: semName, courses: [{ name: "", credits: "", grade: "A" }] });
  render();
  saveData();
}

function removeSemester(semIndex) {
  if (confirm(`Are you sure you want to remove ${semesters[semIndex].name}?`)) {
    semesters.splice(semIndex, 1);
    render();
    saveData();
  }
}

function addCourse(semIndex) {
  semesters[semIndex].courses.push({ name: "", credits: "", grade: "A" });
  render();
  saveData();
}

function removeCourse(semIndex, courseIndex) {
  semesters[semIndex].courses.splice(courseIndex, 1);
  render();
  saveData();
}

function updateCourse(semIndex, courseIndex, field, value) {
  semesters[semIndex].courses[courseIndex][field] = value;
  calculate();
  saveData();
}

function calculate() {
  let totalWeightedPoints = 0;
  let totalCredits = 0;

  semesters.forEach((sem, semIdx) => {
    let semWeightedPoints = 0;
    let semCredits = 0;
    sem.courses.forEach(course => {
      const credits = parseFloat(course.credits) || 0;
      const points = GRADE_POINTS[course.grade] || 0;
      semWeightedPoints += credits * points;
      semCredits += credits;
    });
    const sgpa = semCredits > 0 ? (semWeightedPoints / semCredits).toFixed(2) : "0.00";
    const sgpaEl = document.getElementById(`sgpa-${semIdx}`);
    if (sgpaEl) sgpaEl.textContent = sgpa;
    totalWeightedPoints += semWeightedPoints;
    totalCredits += semCredits;
  });

  const cgpa = totalCredits > 0 ? (totalWeightedPoints / totalCredits).toFixed(2) : "0.00";
  document.getElementById("total-credits").textContent = totalCredits.toFixed(1);
  document.getElementById("final-cgpa").textContent = cgpa;
}

function render() {
  const list = document.getElementById("semesters-list");
  list.innerHTML = "";
  semesters.forEach((sem, semIdx) => {
    // Ensure name is consistent with index (especially after a removal)
    sem.name = `Semester ${semIdx + 1}`;
    
    const block = document.createElement("div");
    block.className = "semester-block";
    block.innerHTML = `
      <div class="semester-header">
        <h2>${sem.name}</h2>
        <div>
          <span style="font-size: 0.8rem; color: var(--text-subtle); margin-right: 10px;">SGPA: <strong id="sgpa-${semIdx}">0.00</strong></span>
          ${semIdx >= 5 ? `<button class="btn-remove-sem" onclick="removeSemester(${semIdx})">Remove</button>` : ''}
        </div>
      </div>
    `;
    sem.courses.forEach((course, courseIdx) => {
      const row = document.createElement("div");
      row.className = "course-row";
      row.innerHTML = `
        <input type="text" placeholder="Course Name" value="${course.name}" oninput="updateCourse(${semIdx}, ${courseIdx}, 'name', this.value)">
        <input type="number" placeholder="Credits" step="0.5" value="${course.credits}" oninput="updateCourse(${semIdx}, ${courseIdx}, 'credits', this.value)">
        <select onchange="updateCourse(${semIdx}, ${courseIdx}, 'grade', this.value)">
          ${Object.keys(GRADE_POINTS).map(g => `<option value="${g}" ${g === course.grade ? 'selected' : ''}>${g}</option>`).join('')}
        </select>
        <button class="remove-course" onclick="removeCourse(${semIdx}, ${courseIdx})">&times;</button>
      `;
      block.appendChild(row);
    });
    const actions = document.createElement("div");
    actions.className = "calc-actions";
    actions.innerHTML = `<button class="calc-btn btn-add" onclick="addCourse(${semIdx})">+ Add Course</button>`;
    block.appendChild(actions);
    list.appendChild(block);
  });
  calculate();
}

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("sync-btn").onclick = () => validateAndUnlock(true);
  document.getElementById("student-id").onkeypress = (e) => { if(e.key === 'Enter') validateAndUnlock(true); };
  document.getElementById("add-semester").onclick = addSemester;
  init();
});