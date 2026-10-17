// ============================================================
// exams.js — mid-sem papers and their portions (exams.html only)
//
// Dates and times are from the BTech Year 3 Mid-Term Exam Schedule PDF
// (Academics, INC-70 mail, 14 Oct). Portions are filled in by hand as profs
// announce them; an empty `topics` list shows "not announced yet".
//
// Each topic is a string, or { t, link } to point at the slides/folder.
// Tick state lives in localStorage under "exams:<code>:<topic text>", keyed
// by text rather than index so reordering the list does not move ticks.
// ============================================================

const EXAMS = [
  { code: "AHUL256", name: "Critical Thinking",
    date: "2026-10-24", report: "10:00", start: "10:30",
    topics: [] },
  { code: "ASBL100", name: "Introductory Biology for Engineers",
    date: "2026-10-26", report: "11:00", start: "11:30",
    topics: [] },
  { code: "AHUL261", name: "Introduction to Psychology",
    date: "2026-10-27", report: "14:00", start: "14:30",
    topics: [] },
  { code: "AENL226", name: "Power Electronics and Power Systems",
    date: "2026-10-28", report: "14:00", start: "14:30",
    topics: [] },
  { code: "AENL228", name: "Measurement & Instrumentation for Energy Systems",
    date: "2026-10-29", report: "08:00", start: "08:30",
    topics: [] }
];

// Blackboard course pages, same URLs as the course cards on the home page.
const EXAM_BB = {
  AENL226: "https://iida.blackboard.com/ultra/courses/_162_1/outline",
  AENL228: "https://iida.blackboard.com/ultra/courses/_163_1/outline",
  AHUL256: "https://iida.blackboard.com/ultra/courses/_182_1/outline",
  AHUL261: "https://iida.blackboard.com/ultra/courses/_183_1/outline",
  ASBL100: "https://iida.blackboard.com/ultra/courses/_190_1/outline"
};

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function tickKey(code, t) { return `exams:${code}:${t}`; }
function getTick(code, t) {
  try { return localStorage.getItem(tickKey(code, t)) === "1"; } catch (e) { return false; }
}
function setTick(code, t, on) {
  try { on ? localStorage.setItem(tickKey(code, t), "1") : localStorage.removeItem(tickKey(code, t)); } catch (e) {}
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
}

function whenLabel(days) {
  if (days < 0) return "done";
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}

function renderExams() {
  const list = document.getElementById("ex-list");
  if (!list) return;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const rows = EXAMS.map((ex) => {
    const [y, m, d] = ex.date.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return { ex, date, days: Math.round((date - today) / 86400000) };
  });
  // Finished papers sink to the bottom; the rest stay in date order.
  rows.sort((a, b) => (a.days < 0) - (b.days < 0) || a.date - b.date);

  list.innerHTML = rows.map(({ ex, date, days }) => {
    const clr = (typeof COURSE_COLORS !== "undefined" && COURSE_COLORS[ex.code]) || "var(--accent)";
    const topics = ex.topics.map((tp) => (typeof tp === "string" ? { t: tp } : tp));
    const ticked = topics.filter((tp) => getTick(ex.code, tp.t)).length;
    const early = Number(ex.report.slice(0, 2)) < 9;

    const body = topics.length
      ? `<ul class="ex-topics">${topics.map((tp) => `
          <li><label>
            <input type="checkbox" data-code="${ex.code}" data-t="${esc(tp.t)}"${getTick(ex.code, tp.t) ? " checked" : ""}>
            <span>${esc(tp.t)}${tp.link ? ` <a href="${esc(tp.link)}" target="_blank" rel="noopener">↗</a>` : ""}</span>
          </label></li>`).join("")}
        </ul>`
      : `<div class="ex-none">Portions not announced yet.</div>`;

    return `
      <article class="ex-row${days < 0 ? " done" : ""}${days === 0 ? " today" : ""}" style="--c:${clr}">
        <div class="ex-date">
          <div class="dow">${DOW[date.getDay()]}</div>
          <div class="day">${String(date.getDate()).padStart(2, "0")}</div>
          <div class="mon">${MON[date.getMonth()]}</div>
        </div>
        <div>
          <div class="ex-head">
            <span class="ex-code">${ex.code}</span>
            <span class="ex-name">${esc(ex.name)}</span>
            <span class="ex-when">${whenLabel(days)}</span>
          </div>
          <div class="ex-meta">
            <span>report <b>${ex.report}</b>${early ? ` <span class="ex-early">early</span>` : ""}</span>
            <span>starts <b>${ex.start}</b></span>
            ${topics.length ? `<span data-count="${ex.code}">${ticked}/${topics.length} revised</span>` : ""}
            ${EXAM_BB[ex.code] ? `<a href="${EXAM_BB[ex.code]}" target="_blank" rel="noopener">Blackboard ↗</a>` : ""}
          </div>
          ${body}
          ${ex.note ? `<div class="ex-note">${esc(ex.note)}</div>` : ""}
        </div>
      </article>`;
  }).join("");
}

document.addEventListener("change", (e) => {
  const box = e.target;
  if (!box.matches || !box.matches(".ex-topics input")) return;
  setTick(box.dataset.code, box.dataset.t, box.checked);
  const ex = EXAMS.find((x) => x.code === box.dataset.code);
  const count = document.querySelector(`[data-count="${box.dataset.code}"]`);
  if (ex && count) {
    const n = ex.topics.filter((tp) => getTick(ex.code, typeof tp === "string" ? tp : tp.t)).length;
    count.textContent = `${n}/${ex.topics.length} revised`;
  }
});

renderExams();
// Re-render on return so "tomorrow" turns into "today" without a reload.
document.addEventListener("visibilitychange", () => { if (!document.hidden) renderExams(); });
