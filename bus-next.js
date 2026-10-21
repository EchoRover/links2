// ============================================================
// bus-next.js — "next shuttle" card on the home page, under the live
// class tracker. Uses the same schedule as /bus (bus-core.js) and the
// same saved route (bus-perspective / bus-destination), so picking a
// route on either page carries over.
//
// With location allowed (bus-locate.js) the route follows you: nearest
// stop as From, campus or your dorm as To. Without it, and with nothing
// saved, it guesses from the clock: dorms → campus before 3 pm.
// ============================================================

(function () {
  if (typeof nextDepartures !== "function") return;

  const NAMES = { kca1: "KCA 1&2", kca3: "KCA 3", campus: "Campus" };
  const LOC = typeof BusLocate !== "undefined" && BusLocate.enabled ? BusLocate : null;

  function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function save(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  let where = "";   // location line under the route, e.g. "📍 You're at KCA 3"

  function route() {
    let loc = load("bus-perspective"), dest = load("bus-destination");
    if (!loc || !dest || !NAMES[loc] || !NAMES[dest] || loc === dest) {
      const afternoon = new Date().getHours() >= 15;
      loc = afternoon ? "campus" : "kca1";
      dest = afternoon ? (load("bus-home-dorm") || "kca1") : "campus";
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
          ${where ? `<span class="bn-where">${where}</span>` : ""}
        </span>
      </a>
      ${LOC ? `<button type="button" class="bn-btn bn-locate" aria-label="Use my location" title="Use my location">📍</button>` : ""}
      <button type="button" class="bn-btn bn-swap" aria-label="Swap direction" title="Swap direction">⇄</button>`;
    card.querySelector(".bn-swap").addEventListener("click", () => {
      save("bus-perspective", dest);
      save("bus-destination", loc);
      if (LOC) LOC.remember(dest, loc);
      render();
    });
    const pin = card.querySelector(".bn-locate");
    if (pin) pin.addEventListener("click", () => { where = "Finding your stop…"; render(); locate(); });
  }

  function locate() {
    return LOC.detect().then((r) => {
      where = LOC.describe(r);
      if (!r.error && r.near) LOC.apply(r.stop);
      render();
    });
  }

  window.addEventListener("DOMContentLoaded", () => {
    render();
    setInterval(render, 30000);
    const auto = () => { if (LOC) LOC.allowed().then((ok) => { if (ok) locate(); }); };
    auto();
    document.addEventListener("visibilitychange", () => { if (!document.hidden) { render(); auto(); } });
  });
})();
