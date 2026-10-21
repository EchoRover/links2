// ============================================================
// bus-next.js — "next shuttle" card on the home page, under the live
// class tracker. Uses the same schedule as /bus (bus-core.js) and the
// same saved route (bus-perspective / bus-destination), so picking a
// route on either page carries over. With no saved route it guesses
// from the clock: dorms → campus before 3 pm, campus → dorms after.
// ============================================================

(function () {
  if (typeof nextDepartures !== "function") return;

  const NAMES = { kca1: "KCA 1&2", kca3: "KCA 3", campus: "Campus" };

  function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function save(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function route() {
    let loc = load("bus-perspective"), dest = load("bus-destination");
    if (!loc || !dest || !NAMES[loc] || !NAMES[dest] || loc === dest) {
      const afternoon = new Date().getHours() >= 15;
      loc = afternoon ? "campus" : "kca1";
      dest = afternoon ? "kca1" : "campus";
    }
    return { loc, dest };
  }

  let card = null;

  function render() {
    const host = document.getElementById("timetable-box");
    if (!host) return;
    if (!card) {
      card = document.createElement("div");
      card.className = "bus-next";
      host.after(card);
    }
    const { loc, dest } = route();
    const now = new Date().getHours() * 60 + new Date().getMinutes();
    const trips = nextDepartures(loc, dest, now, 3);
    const first = trips[0];

    let main, sub;
    if (!first) {
      main = "No shuttle listed";
      sub = "";
    } else if (first.tomorrow) {
      main = `Done for today · first tomorrow ${to12h(first.departTime)}`;
      sub = "";
    } else {
      const mins = first.departMins - now;
      main = `${to12h(first.departTime)} <span class="bn-in">${mins === 0 ? "leaving now" : `in ${untilLabel(first.departMins, now)}`}</span>`;
      sub = trips.slice(1).filter((t) => !t.tomorrow).map((t) => to12hSimple(t.departTime)).join(" · ");
      if (sub) sub = `then ${sub}`;
      if (first.assumed) sub += (sub ? " · " : "") + "late runs are assumed, check the board";
    }

    card.innerHTML = `
      <a class="bn-link" href="bus">
        <span class="bn-icon" aria-hidden="true">🚍</span>
        <span class="bn-body">
          <span class="bn-route">Next shuttle · ${NAMES[loc]} → ${NAMES[dest]}</span>
          <span class="bn-main">${main}</span>
          ${sub ? `<span class="bn-sub">${sub}</span>` : ""}
        </span>
      </a>
      <button type="button" class="bn-swap" aria-label="Swap direction" title="Swap direction">⇄</button>`;
    card.querySelector(".bn-swap").addEventListener("click", () => {
      save("bus-perspective", dest);
      save("bus-destination", loc);
      render();
    });
  }

  window.addEventListener("DOMContentLoaded", () => {
    render();
    setInterval(render, 30000);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) render(); });
  });
})();
