// ============================================================
// exam-day.js — the "you have a paper" card on the home page.
//
// Shows from 6 pm the evening before a mid-sem paper until two hours after
// it starts: a live countdown to report time, the report/start times, a
// kit checklist (ticks stay on this device) and a link to the portions.
// Papers come from window.MIDSEM_PAPERS (exam-mode.js), so dates live in
// one place. The schedule PDF lists no rooms, so the card doesn't either.
//
//   ?examday=ASBL100   preview the card for any paper, any day
// ============================================================

(function () {
  const PAPERS = window.MIDSEM_PAPERS;
  if (!PAPERS) return;

  const SHOW_FROM_HOUR = 18;          // evening before
  const HIDE_AFTER_MIN = 120;         // after the start
  const KIT = ["Student ID card", "Two pens that work", "Pencil, eraser, ruler", "Water bottle"];

  const forced = new URLSearchParams(location.search).get("examday");

  function window_(p) {
    const from = new Date(p.at);
    from.setDate(from.getDate() - 1);
    from.setHours(SHOW_FROM_HOUR, 0, 0, 0);
    return { from, to: new Date(p.at.getTime() + HIDE_AFTER_MIN * 60000) };
  }

  function current(now) {
    if (forced) return PAPERS.find((p) => p.code === forced.toUpperCase()) || null;
    return PAPERS.find((p) => { const w = window_(p); return now >= w.from && now < w.to; }) || null;
  }

  const hm = (d) => d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  function span(ms) {
    const m = Math.max(0, Math.round(ms / 60000));
    const h = Math.floor(m / 60), d = Math.floor(h / 24);
    if (d) return `${d}d ${h % 24}h`;
    return h ? `${h}h ${m % 60}m` : `${m}m`;
  }

  // "Today", "Tomorrow", or the weekday for a ?examday= preview further out.
  function dayWord(p, now) {
    const a = new Date(now); a.setHours(0, 0, 0, 0);
    const b = new Date(p.at); b.setHours(0, 0, 0, 0);
    const days = Math.round((b - a) / 864e5);
    return days === 0 ? "Today" : days === 1 ? "Tomorrow" : p.at.toLocaleDateString("en-GB", { weekday: "long" });
  }

  function kitKey(p, i) { return `examday:${p.code}:${i}`; }
  function ticked(p, i) { try { return localStorage.getItem(kitKey(p, i)) === "1"; } catch (e) { return false; } }
  function setTicked(p, i, on) {
    try { on ? localStorage.setItem(kitKey(p, i), "1") : localStorage.removeItem(kitKey(p, i)); } catch (e) {}
  }

  function status(p, now) {
    if (now < p.report) {
      const when = dayWord(p, now), today = when === "Today";
      return {
        when,
        big: `Report in ${span(p.report - now)}`,
        tip: today ? "Eat something and leave a little early." : "Pack the kit tonight. Sleep beats one more chapter."
      };
    }
    if (now < p.at) return { when: "Now", big: `Starts in ${span(p.at - now)}`, tip: "You should be in your seat." };
    return { when: "Now", big: "In progress", tip: "Good luck. Read every question twice." };
  }

  let card = null;

  function render() {
    const now = new Date();
    const p = current(now);
    if (!p) { if (card) { card.remove(); card = null; } return; }

    const host = document.querySelector(".left-col");
    if (!host) return;
    if (!card) {
      card = document.createElement("section");
      card.className = "exam-day";
      card.setAttribute("aria-live", "polite");
      host.prepend(card);
    }
    const s = status(p, now);
    const kit = p.calc ? [...KIT, "Calculator (check it's allowed)"] : KIT;
    const clr = (typeof COURSE_COLORS !== "undefined" && COURSE_COLORS[p.code]) || "var(--accent)";
    const day = p.at.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
    card.style.setProperty("--c", clr);
    card.innerHTML = `
      <div class="ed-top">
        <span class="ed-when">${s.when}</span>
        <span class="ed-code">${p.code}</span>
      </div>
      <div class="ed-name">${p.name}</div>
      <div class="ed-big">${s.big}</div>
      <div class="ed-times">
        <span><small>report</small> ${hm(p.report)}</span>
        <span><small>starts</small> ${hm(p.at)}</span>
        <span><small>date</small> ${day}</span>
      </div>
      <p class="ed-tip">${s.tip}</p>
      <ul class="ed-kit">
        ${kit.map((k, i) => `<li><label><input type="checkbox" data-i="${i}"${ticked(p, i) ? " checked" : ""}> ${k}</label></li>`).join("")}
      </ul>
      <a class="ed-link" href="exams">Portions &amp; slides →</a>`;
    card.querySelectorAll("input[data-i]").forEach((cb) => {
      cb.addEventListener("change", () => setTicked(p, Number(cb.dataset.i), cb.checked));
    });
  }

  window.addEventListener("DOMContentLoaded", () => {
    render();
    setInterval(render, 30000);
  });
})();
