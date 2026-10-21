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

// Slides live in notes/<code>/, mirrored from Blackboard (17 Oct).
const N = (code, file) => `notes/${code}/${file}.pdf`;
// Critical Thinking is a single deck, so topics jump to a page instead.
const CT = (page) => `notes/AHUL256/critical-thinking-slides.pdf#page=${page}`;

const EXAMS = [
  { code: "AHUL256", name: "Critical Thinking",
    date: "2026-10-24", report: "10:00", start: "10:30",
    note: "Everything taught till 7 Oct. All of it sits in one 174-slide deck; each link opens at its section.",
    topics: [
      { t: "1.1 What is philosophy?", link: CT(2) },
      { t: "2.1 The brain is an inference machine", link: CT(16) },
      { t: "1.2 How do philosophers arrive at truth?", link: CT(31) },
      { t: "5.1 Methods for discovering truth", link: CT(37) },
      { t: "5.2 Logical statements", link: CT(50) },
      { t: "5.3 Arguments", link: CT(54) },
      { t: "5.4 Deductive, inductive, abductive inferences", link: CT(58) },
      { t: "5.5 Informal fallacies", link: CT(92) },
      { t: "Philosophy of the Americas", link: CT(109) },
      { t: "African, Indian and Chinese philosophy", link: CT(117) },
      { t: "4.1 Historiography", link: CT(141) },
      { t: "4.2 Classical philosophy", link: CT(144) },
      { t: "4.3 Jewish, Christian and Islamic philosophy", link: CT(159) }
    ] },
  { code: "ASBL100", name: "Introductory Biology for Engineers",
    date: "2026-10-26", report: "11:00", start: "11:30",
    note: "Everything taught till 16 Oct. Lecture 4 was never put on Blackboard.",
    topics: [
      { t: "L1 Introduction", link: N("ASBL100", "L01-introduction") },
      { t: "L2 Darwinian evolution, origin of life", link: N("ASBL100", "L02-evolution-origin-of-life") },
      { t: "L3 Evolution", link: N("ASBL100", "L03-evolution") },
      { t: "L5 DNA", link: N("ASBL100", "L05-dna") },
      { t: "L6 Genetics and heredity I", link: N("ASBL100", "L06-genetics-heredity-1") },
      { t: "L7 Genetics and heredity II", link: N("ASBL100", "L07-genetics-heredity-2") },
      { t: "L8 Genetics and heredity III", link: N("ASBL100", "L08-genetics-heredity-3") },
      { t: "L9 Carbohydrates", link: N("ASBL100", "L09-carbohydrates") },
      { t: "L10 Proteins I", link: N("ASBL100", "L10-proteins-1") },
      { t: "L11 Proteins II", link: N("ASBL100", "L11-proteins-2") },
      { t: "L12 Proteins III", link: N("ASBL100", "L12-proteins-3") },
      { t: "L13 Membranes I", link: N("ASBL100", "L13-membrane-1") },
      { t: "L14 Membranes II", link: N("ASBL100", "L14-membrane-2") },
      { t: "L15 Membrane transport", link: N("ASBL100", "L15-membrane-transport") },
      { t: "L16 Replication", link: N("ASBL100", "L16-replication") },
      { t: "L17 Transcription and translation", link: N("ASBL100", "L17-transcription-translation") },
      { t: "L18 Cells", link: N("ASBL100", "L18-cells") },
      { t: "L19 (AKP)", link: N("ASBL100", "L19-akp") },
      { t: "L20 Cell cycle", link: N("ASBL100", "L20-cell-cycle") },
      { t: "L21 Cell division", link: "https://iida.blackboard.com/ultra/courses/_190_1/outline" }
    ] },
  { code: "AHUL261", name: "Introduction to Psychology",
    date: "2026-10-27", report: "14:00", start: "14:30",
    note: "Everything taught so far.",
    topics: [
      { t: "Introduction", link: N("AHUL261", "01-introduction") },
      { t: "History of psychology", link: N("AHUL261", "02-history-of-psychology") },
      { t: "Thinking like a psychological scientist", link: N("AHUL261", "03-thinking-like-a-psych-scientist") },
      { t: "Research designs", link: N("AHUL261", "04-research-designs") },
      { t: "Self and identity", link: N("AHUL261", "05-self-and-identity") },
      { t: "Sensation and perception", link: N("AHUL261", "06-sensation-and-perception") },
      { t: "Conditioning and learning", link: N("AHUL261", "07-conditioning-and-learning") },
      { t: "Memory and forgetting", link: N("AHUL261", "08-memory-and-forgetting") }
    ] },
  { code: "AENL226", name: "Power Electronics and Power Systems",
    date: "2026-10-28", report: "14:00", start: "14:30",
    note: "Everything taught till 26 Oct, both halves.",
    topics: [
      { t: "PS L1 Course overview", link: N("AENL226", "PS-L1-course-overview") },
      { t: "PS L2–3 System modelling", link: N("AENL226", "PS-L2-3-system-modelling") },
      { t: "PS L4 Per-unit", link: N("AENL226", "PS-L4-per-unit") },
      { t: "PS L5 Component models and bus types", link: N("AENL226", "PS-L5-component-models-bus-types") },
      { t: "PS L6–7 Power flow equations and Ybus", link: N("AENL226", "PS-L6-7-power-flow-ybus") },
      { t: "PS Notes to read with L6", link: N("AENL226", "PS-notes-with-L6") },
      { t: "PS Ybus formation", link: N("AENL226", "PS-ybus-formation") },
      { t: "PS Power flow notes", link: N("AENL226", "PS-power-flow-notes") },
      { t: "PE L1 Introduction", link: N("AENL226", "PE-L1-introduction") },
      { t: "PE L2 Power switches", link: N("AENL226", "PE-L2-power-switches") },
      { t: "PE L3 Switch losses", link: N("AENL226", "PE-L3-switch-losses") },
      { t: "PE L4 DC-DC converters, part 1", link: N("AENL226", "PE-L4-dc-dc-part1") },
      { t: "Tutorial 1 Per-unit", link: N("AENL226", "T1-per-unit") },
      { t: "Tutorial 2 Ybus", link: N("AENL226", "T2-ybus") },
      { t: "Tutorial 2 branch data (4-bus, 30-bus)", link: N("AENL226", "T2-ybus-branch-data") },
      { t: "Tutorial 3 Power flow", link: N("AENL226", "T3-power-flow") },
      { t: "Tutorial 3 Newton-Raphson data", link: N("AENL226", "T3-newton-raphson-data") },
      { t: "PE Problem set 1", link: N("AENL226", "PE-problem-set-1") },
      { t: "PE Problem sheet 2", link: N("AENL226", "PE-problem-sheet-2") }
    ] },
  { code: "AENL228", name: "Measurement & Instrumentation for Energy Systems",
    date: "2026-10-29", report: "08:00", start: "08:30",
    note: "Modules 1 and 2.",
    topics: [
      { t: "Module 1 slides", link: N("AENL228", "module-1-slides") },
      { t: "Module 2 slides, part 1", link: N("AENL228", "module-2-slides-part-1") },
      { t: "Assignment 1", link: N("AENL228", "assignment-1") }
    ] }
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

// Open/closed state per paper, "1"/"0". Unset means "open only if it is
// the next paper", so a fresh device lands on the paper that matters.
function openKey(code) { return `exams:open:${code}`; }
function getOpen(code) {
  try { return localStorage.getItem(openKey(code)); } catch (e) { return null; }
}
function setOpen(code, on) {
  try { localStorage.setItem(openKey(code), on ? "1" : "0"); } catch (e) {}
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
}

// Ticked count plus the first unticked topic, which the card shows as
// "next" so you can pick up where you stopped without opening it.
function progress(ex) {
  const ts = ex.topics.map((tp) => (typeof tp === "string" ? tp : tp.t));
  const done = ts.filter((t) => getTick(ex.code, t));
  const next = ts.find((t) => !getTick(ex.code, t));
  return { n: done.length, total: ts.length, next };
}
function nextLabel(p) { return p.next ? `next · ${p.next}` : "all revised ✓"; }

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

  const next = rows.find((r) => r.days >= 0);

  list.innerHTML = rows.map(({ ex, date, days }) => {
    const clr = (typeof COURSE_COLORS !== "undefined" && COURSE_COLORS[ex.code]) || "var(--accent)";
    const topics = ex.topics.map((tp) => (typeof tp === "string" ? { t: tp } : tp));
    const prog = progress(ex);
    const ticked = prog.n;
    const early = Number(ex.report.slice(0, 2)) < 9;
    const saved = getOpen(ex.code);
    const open = saved === null ? next && next.ex === ex : saved === "1";
    const pct = topics.length ? Math.round((ticked / topics.length) * 100) : 0;

    const body = topics.length
      ? `<ul class="ex-topics">${topics.map((tp) => `
          <li><label>
            <input type="checkbox" data-code="${ex.code}" data-t="${esc(tp.t)}"${getTick(ex.code, tp.t) ? " checked" : ""}>
            <span>${esc(tp.t)}</span>
          </label>${tp.link ? `<a class="ex-open" href="${esc(tp.link)}" target="_blank" rel="noopener" aria-label="Open slides: ${esc(tp.t)}" title="Open slides">↗</a>` : ""}</li>`).join("")}
        </ul>`
      : ex.note ? "" : `<div class="ex-none">Portions not announced yet.</div>`;

    return `
      <details class="ex-row${days < 0 ? " done" : ""}${days === 0 ? " today" : ""}" style="--c:${clr}" data-code="${ex.code}"${open ? " open" : ""}>
        <summary class="ex-sum">
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
            ${topics.length ? `<div class="ex-prog"><span class="ex-bar"><i data-bar="${ex.code}" style="width:${pct}%"></i></span><span data-count="${ex.code}">${ticked}/${topics.length}</span></div>
            <div class="ex-next" data-next="${ex.code}">${esc(nextLabel(prog))}</div>` : ""}
          </div>
          <span class="ex-chev" aria-hidden="true">›</span>
        </summary>
        <div class="ex-body">
          <div class="ex-meta">
            <span>report <b>${ex.report}</b>${early ? ` <span class="ex-early">early</span>` : ""}</span>
            <span>starts <b>${ex.start}</b></span>
            ${EXAM_BB[ex.code] ? `<a href="${EXAM_BB[ex.code]}" target="_blank" rel="noopener">Blackboard ↗</a>` : ""}
            ${topics.length ? `<button class="ex-reset" type="button" data-reset="${ex.code}"${ticked ? "" : " hidden"}>reset ticks</button>` : ""}
          </div>
          ${ex.note ? `<div class="ex-note">${esc(ex.note)}</div>` : ""}
          ${body}
        </div>
      </details>`;
  }).join("");
}

function updateProgress(code) {
  const ex = EXAMS.find((x) => x.code === code);
  if (!ex) return;
  const p = progress(ex);
  const q = (attr) => document.querySelector(`[${attr}="${code}"]`);
  if (q("data-count")) q("data-count").textContent = `${p.n}/${p.total}`;
  if (q("data-bar")) q("data-bar").style.width = `${Math.round((p.n / p.total) * 100)}%`;
  if (q("data-next")) q("data-next").textContent = nextLabel(p);
  if (q("data-reset")) q("data-reset").hidden = p.n === 0;
}

document.addEventListener("change", (e) => {
  const box = e.target;
  if (!box.matches || !box.matches(".ex-topics input")) return;
  setTick(box.dataset.code, box.dataset.t, box.checked);
  updateProgress(box.dataset.code);
});

// Reset asks for a second tap instead of confirm(), which would block the
// page; the button reverts if the second tap does not come within 3 s.
document.addEventListener("click", (e) => {
  const btn = e.target.closest && e.target.closest(".ex-reset");
  if (!btn) return;
  const code = btn.dataset.reset;
  if (!btn.dataset.armed) {
    btn.dataset.armed = "1";
    btn.textContent = "tap again to clear";
    setTimeout(() => { delete btn.dataset.armed; btn.textContent = "reset ticks"; }, 3000);
    return;
  }
  const ex = EXAMS.find((x) => x.code === code);
  ex.topics.forEach((tp) => setTick(code, typeof tp === "string" ? tp : tp.t, false));
  document.querySelectorAll(`.ex-topics input[data-code="${code}"]`).forEach((b) => { b.checked = false; });
  delete btn.dataset.armed;
  btn.textContent = "reset ticks";
  updateProgress(code);
});

// Remember taps on the summary, not "toggle": toggle also fires when
// renderExams inserts an open <details>, which would pin the auto-opened
// paper open forever. Keyboard Enter/Space on a summary also fires click.
document.addEventListener("click", (e) => {
  const sum = e.target.closest && e.target.closest("summary.ex-sum");
  if (!sum) return;
  const row = sum.parentElement;
  setOpen(row.dataset.code, !row.open);  // click runs before the flip
});

renderExams();
// Re-render on return so "tomorrow" turns into "today" without a reload.
document.addEventListener("visibilitychange", () => { if (!document.hidden) renderExams(); });
