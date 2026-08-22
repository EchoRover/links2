// ============================================================
// BUS / VAN SHUTTLE SCHEDULE — KCA 1&2 · KCA 3 · Campus
//
// The loop is one clockwise cycle:
//     KCA 1&2  ->  KCA 3  ->  Campus  ->  KCA 1&2  ->  ...
// so "Dorms to Campus" departs KCA 1&2 and "Campus to Dorms"
// departs Campus. KCA 3 is the middle stop on BOTH legs.
//
// TWO SERVICES, and they are not the same timetable:
//
//   Mon–Fri  the printed shift poster (photographed 2026-08-19).
//            A 7-vehicle day rota, then a two-van night shift.
//
//   Sat–Sun  the campus notice of 2026-08-22, verbatim: "Saturdays and
//            Sundays, vehicles will operate between the campus and
//            KCA 1,2 & 3 every 30 minutes in both directions, starting
//            from 7:30 AM."
//            CONFIRMED by that notice: the 7:30 AM start, the 30-minute
//            interval, both directions, the same three stops.
//            NOT in it: a LAST departure, and which vehicle runs which
//            trip. So the weekend list is split — everything up to
//            6:30 PM follows the notice, and the later runs are kept in
//            their own block, labelled as assumed, because a guessed
//            time that renders like a confirmed one is how someone ends
//            up standing at a stop at 11 PM for nothing.
//            When someone reads the actual board: fix WEEKEND_LAST.
//
// Friday Prayer:
//   Between 12:30 PM and 1:15 PM (inclusive) on Fridays, no shuttle service runs.
//
// Times are stored as "HH:MM" 24h for math, rendered as 12h.
// ============================================================

const DAY_ROTA = ["Coaster 1", "Coaster 2", "Coaster 3", "Bus 1", "Bus 2", "Bus 3", "Coaster 4"];

// Weekend: start + interval are from the notice. The cut and the last
// departure are not.
const WEEKEND_START = "07:30";
const WEEKEND_NOTICE_UNTIL = "18:30";   // where the confirmed block ends
const WEEKEND_LAST = "23:30";           // ASSUMED, not from the notice
const WEEKEND_STEP = 30;

// Location timing offsets (in minutes) relative to base departures:
// toCampus base departs KCA 1&2 (kca1)
// toDorms base departs Campus (campus)
const OFFSETS = {
    toCampus: {
        kca1: 0,
        kca3: 3,
        campus: 15
    },
    toDorms: {
        campus: 0,
        kca1: 15,
        kca3: 18
    }
};

let currentLoc = localStorage.getItem("bus-perspective") || "kca1";

// The two directions share their stops across both services.
const DIRS = {
    toCampus: {
        id: "toCampus",
        label: "Dorms → Campus",
        short: "To Campus",
        from: "KCA 1&2",
        stops: ["KCA 1&2", "KCA 3", "Campus"],
    },
    toDorms: {
        id: "toDorms",
        label: "Campus → Dorms",
        short: "To Dorms",
        from: "Campus",
        stops: ["Campus", "KCA 1&2", "KCA 3"],
    },
};

// "07:30" .. "18:30" every 30 -> ["07:30", "08:00", ...]
function everyN(startHHMM, lastHHMM, stepMin) {
    const out = [];
    for (let m = toMinutes(startHHMM); m <= toMinutes(lastHHMM); m += stepMin) {
        out.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
    }
    return out;
}

const SCHEDULES = {
    // ---------- Mon–Fri: the printed poster ----------
    weekday: {
        key: "weekday",
        label: "Mon – Fri",
        short: "Mon – Fri",
        numbering: "perBlock",       // the poster restarts at 1 for the night shift
        dirs: {
            toCampus: {
                ...DIRS.toCampus,
                blocks: [
                    {
                        title: "Day shift", tag: "day shift", tagTone: "day", rota: DAY_ROTA,
                        times: [
                            "07:00", "07:10", "07:20", "07:30", "07:40", "07:50",
                            "08:00", "08:10", "08:20", "08:30", "08:40", "08:50",
                            "09:00", "09:10", "09:20", "09:30", "09:40", "09:50",
                            "10:00", "10:15", "10:30", "10:45",
                            "11:00", "11:15", "11:30", "11:45",
                            "12:00", "12:15", "12:30", "12:45",
                            "13:00", "13:15", "13:30", "13:40", "13:50",
                            "14:00", "14:10", "14:20", "14:30", "14:40", "14:50",
                            "15:00", "15:10", "15:20", "15:30", "15:45",
                            "16:00", "16:15", "16:30", "16:45",
                            "17:00", "17:15", "17:30", "17:45",
                            "18:00", "18:15", "18:30", "18:45",
                        ],
                    },
                    {
                        title: "Night shift", tag: "night shift", tagTone: "night", dashed: true,
                        rota: ["VAN 1", "VAN 2"],
                        times: [
                            "19:00", "19:20", "19:40",
                            "20:00", "20:20", "20:40",
                            "21:00", "21:20", "21:40",
                            "22:00", "22:20", "22:40",
                            "23:00", "23:20",
                        ],
                    },
                ],
            },
            toDorms: {
                ...DIRS.toDorms,
                blocks: [
                    {
                        title: "Day shift", tag: "day shift", tagTone: "day", rota: DAY_ROTA,
                        times: [
                            "07:30", "07:40", "07:50",
                            "08:00", "08:10", "08:20", "08:30", "08:40", "08:50",
                            "09:00", "09:10", "09:20", "09:30", "09:40", "09:50",
                            "10:00", "10:00", "10:15", "10:30", "10:45",
                            "11:00", "11:15", "11:30", "11:45",
                            "12:00", "12:15", "12:30", "12:45",
                            "13:00", "13:15", "13:30", "13:40", "13:50",
                            "14:00", "14:10", "14:20", "14:30", "14:40", "14:50",
                            "15:00", "15:10", "15:20", "15:30", "15:45",
                            "16:00", "16:15", "16:30", "16:45",
                            "17:00", "17:15", "17:30", "17:45",
                            "18:00", "18:15", "18:30", "18:45",
                        ],
                    },
                    {
                        title: "Night shift", tag: "night shift", tagTone: "night", dashed: true,
                        rota: ["VAN 2", "VAN 1"],
                        times: [
                            "19:00", "19:20", "19:40",
                            "20:00", "20:20", "20:40",
                            "21:00", "21:20", "21:40",
                            "22:00", "22:20", "22:40",
                            "23:00", "23:20", "23:40",
                            "24:00",
                        ],
                    },
                ],
            },
        },
    },

    // ---------- Sat–Sun: the notice ----------
    weekend: {
        key: "weekend",
        label: "Sat & Sun",
        short: "Sat & Sun",
        numbering: "continuous",     // one service, so the numbers just run on
        caveat: "The campus notice gives the start (7:30 AM), the 30-minute interval and both directions. " +
            "It does not give a last departure, and it says nothing about which vehicle runs which trip. " +
            "Everything through 6:30 PM below is the notice; the later block is an assumption that the " +
            "service keeps going as late as it does on weekdays. Check the board before counting on a late run.",
        dirs: {
            toCampus: {
                ...DIRS.toCampus,
                blocks: [
                    {
                        title: "Every 30 minutes — from the notice", tag: "every 30 min", tagTone: "day",
                        times: everyN(WEEKEND_START, WEEKEND_NOTICE_UNTIL, WEEKEND_STEP),
                    },
                    {
                        title: "Later runs — assumed, not in the notice", tag: "assumed", tagTone: "soft",
                        dashed: true, assumed: true,
                        times: everyN("19:00", WEEKEND_LAST, WEEKEND_STEP),
                    },
                ],
            },
            toDorms: {
                ...DIRS.toDorms,
                blocks: [
                    {
                        title: "Every 30 minutes — from the notice", tag: "every 30 min", tagTone: "day",
                        times: everyN(WEEKEND_START, WEEKEND_NOTICE_UNTIL, WEEKEND_STEP),
                    },
                    {
                        title: "Later runs — assumed, not in the notice", tag: "assumed", tagTone: "soft",
                        dashed: true, assumed: true,
                        times: everyN("19:00", WEEKEND_LAST, WEEKEND_STEP),
                    },
                ],
            },
        },
    },
};

// ---------- helpers ----------

// "13:45" -> 825.
function toMinutes(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
}

// 825 -> "1:45 PM".
function to12h(hhmm) {
    let [h, m] = hhmm.split(":").map(Number);
    h = h % 24;
    const suffix = h < 12 ? "AM" : "PM";
    let display = h % 12;
    if (display === 0) display = 12;
    return `${display}:${String(m).padStart(2, "0")} ${suffix}`;
}

// 825 -> "1:45" (without AM/PM)
function to12hSimple(hhmm) {
    let [h, m] = hhmm.split(":").map(Number);
    h = h % 24;
    let display = h % 12;
    if (display === 0) display = 12;
    return `${display}:${String(m).padStart(2, "0")}`;
}

// Add minutes to HH:MM time and return HH:MM
function addMins(hhmm, offset) {
    const mins = toMinutes(hhmm) + offset;
    const h = Math.floor(mins / 60) % 24;
    const m = mins % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// Which service runs on a given date.
function dayKey(d) {
    const n = d.getDay();
    return (n === 0 || n === 6) ? "weekend" : "weekday";
}

function todayKey() {
    return dayKey(new Date());
}

function tomorrowKey() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return dayKey(d);
}

// Number the trips of one direction, adjusting for location perspective,
// filtering out Friday prayer suspensions, and generating the stop timelines.
function trips(sched, dir) {
    let n = 0;
    const isFriday = new Date().getDay() === 5;
    const offset = OFFSETS[dir.id][currentLoc] || 0;
    const isToCampus = dir.id === "toCampus";

    const blocks = dir.blocks.map((b) => {
        if (sched.numbering !== "continuous") n = 0;
        let times = b.times;

        // Filter out Friday prayer times (12:30 PM to 1:15 PM inclusive => 750 to 795 mins) on Fridays:
        if (isFriday && sched.key === "weekday") {
            times = times.filter(t => {
                const mins = toMinutes(t);
                return mins < 750 || mins > 795;
            });
        }

        const rows = times.map((t, i) => {
            const baseMins = toMinutes(t);
            const adjustedMins = baseMins + offset;
            const h = Math.floor(adjustedMins / 60) % 24;
            const m = adjustedMins % 60;
            const adjustedTime = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

            const vehicle = b.rota ? b.rota[i % b.rota.length] : null;
            let vehPrefix = "";
            if (vehicle) {
                const isVan = vehicle.toLowerCase().includes("van");
                vehPrefix = isVan ? `🚐 ${vehicle} | ` : `🚍 ${vehicle} | `;
            }

            // Generate compact route timing sequence:
            const t1 = to12hSimple(t);
            const t2 = to12hSimple(addMins(t, isToCampus ? 3 : 15));
            const t3 = to12hSimple(addMins(t, isToCampus ? 15 : 18));
            const timelineText = isToCampus
                ? `${vehPrefix}KCA1: ${t1} ➔ KCA3: ${t2} ➔ Campus: ${t3}`
                : `${vehPrefix}Campus: ${t1} ➔ KCA1: ${t2} ➔ KCA3: ${t3}`;

            return {
                no: ++n,
                baseTime: t,
                time: adjustedTime,
                mins: adjustedMins,
                timeline: timelineText,
                vehicle: vehicle,
                tag: b.tag || null,
                tagTone: b.tagTone || "day",
                assumed: !!b.assumed,
            };
        });
        return { ...b, rows };
    });
    return { blocks, all: blocks.reduce((acc, b) => acc.concat(b.rows), []) };
}

function hasVehicles(dir) {
    return dir.blocks.some((b) => b.rota);
}

function nowMinutes() {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
}

function untilLabel(mins, now) {
    let delta = mins - now;
    if (delta < 0) delta += 24 * 60; // rolls to tomorrow
    if (delta === 0) return "now";
    if (delta < 60) return `${delta} min`;
    const h = Math.floor(delta / 60);
    const m = delta % 60;
    return m ? `${h} h ${m} m` : `${h} h`;
}

// ---------- rendering ----------

function renderNext(dirId, now) {
    let sched = SCHEDULES[todayKey()];
    let dir = sched.dirs[dirId];
    let data = trips(sched, dir);
    let upcoming = data.all.filter((t) => t.mins >= now).slice(0, 3);
    let tomorrow = false;

    if (!upcoming.length) {
        sched = SCHEDULES[tomorrowKey()];
        dir = sched.dirs[dirId];
        data = trips(sched, dir);
        upcoming = data.all.slice(0, 3);
        tomorrow = true;
    }

    const head = upcoming[0];
    const rest = upcoming.slice(1);

    // Context label showing what stop timing is rendered:
    let locationLabel = "";
    if (dirId === "toCampus") {
        if (currentLoc === "kca1") locationLabel = "at KCA 1&2";
        else if (currentLoc === "kca3") locationLabel = "at KCA 3";
        else if (currentLoc === "campus") locationLabel = "at Campus";
    } else {
        if (currentLoc === "campus") locationLabel = "at Campus";
        else if (currentLoc === "kca1") locationLabel = "at KCA 1&2";
        else if (currentLoc === "kca3") locationLabel = "at KCA 3";
    }

    return `
    <article class="next-card" data-dir="${dir.id}">
        <header class="next-head">
            <span class="next-dir">${dir.label}</span>
            <span class="next-from">${locationLabel} · ${sched.label}</span>
        </header>
        <div class="next-lead">
            <span class="next-eta">${tomorrow ? "tomorrow" : untilLabel(head.mins, now)}</span>
            <span class="next-time">${to12h(head.time)}</span>
        </div>
        <div class="next-timeline" style="font-family: var(--font-mono); font-size: 0.68rem; color: var(--fg-soft); margin: 0.35rem 0 0.15rem; letter-spacing: -0.01em;">
            ${head.timeline}
        </div>
        <div class="next-meta">
            ${head.tag ? `<span class="tag tag-${head.tagTone}">${head.tag}</span>` : ""}
            ${head.vehicle ? `<span class="next-veh">${head.vehicle}</span>` : ""}
        </div>
        <ul class="next-then">
            ${rest.map((t) => `
                <li>
                    <span class="then-time">${to12h(t.time)}</span>
                    <span class="then-eta">${tomorrow ? "&nbsp;" : untilLabel(t.mins, now)}</span>
                    <span class="then-veh">${t.vehicle || (t.assumed ? "assumed" : "")}</span>
                </li>`).join("")}
        </ul>
    </article>`;
}

function renderTable(dir, block, now, showVeh, nextMins) {
    let timeHeader = "";
    if (dir.id === "toCampus") {
        if (currentLoc === "kca1") timeHeader = "Departs KCA 1&2";
        else if (currentLoc === "kca3") timeHeader = "Departs KCA 3";
        else if (currentLoc === "campus") timeHeader = "Arrives Campus";
    } else {
        if (currentLoc === "campus") timeHeader = "Departs Campus";
        else if (currentLoc === "kca1") timeHeader = "Arrives KCA 1&2";
        else if (currentLoc === "kca3") timeHeader = "Arrives KCA 3";
    }

    return `
    <div class="sched-block${block.dashed ? " sched-dashed" : ""}">
        <h3 class="sched-title">${block.title}</h3>
        <div class="sched-scroll">
            <table class="sched">
                <thead>
                    <tr>
                        <th class="c-no">#</th>
                        <th class="c-time">${timeHeader}</th>
                        <th class="c-route">Route</th>
                        ${showVeh ? '<th class="c-veh">Vehicle</th>' : ""}
                    </tr>
                </thead>
                <tbody>
                    ${block.rows.map((t) => {
                        const past = nextMins !== null && t.mins < now;
                        const isNext = t.mins === nextMins;
                        const cls = [past ? "past" : "", isNext ? "next" : ""].filter(Boolean).join(" ");
                        return `
                        <tr class="${cls}"${isNext ? ' id="next-' + dir.id + '"' : ""}>
                            <td class="c-no">${t.no}</td>
                            <td class="c-time">
                                <div style="font-size: 0.85rem; font-weight: 600; color: var(--fg);">${to12h(t.time)}</div>
                                <div style="font-size: 0.68rem; color: var(--fg-soft); font-weight: 500; margin-top: 2px; font-family: var(--font-mono); letter-spacing: -0.01em;">
                                    ${t.timeline}
                                </div>
                            </td>
                            <td class="c-route">${dir.stops.join(" → ")}</td>
                            ${showVeh ? `<td class="c-veh">${t.vehicle || ""}</td>` : ""}
                        </tr>`;
                    }).join("")}
                </tbody>
            </table>
        </div>
    </div>`;
}

let elNext, elSched, elClock, elCaveat, elToday;

let viewKey = todayKey();

function nextKey(now) {
    const sched = SCHEDULES[todayKey()];
    return ["toCampus", "toDorms"]
        .map((id) => {
            const up = trips(sched, sched.dirs[id]).all.find((t) => t.mins >= now);
            return up ? up.time : "end";
        })
        .join("|");
}

function renderNextCards(now) {
    if (!elNext) return;
    elNext.innerHTML = ["toCampus", "toDorms"].map((id) => renderNext(id, now)).join("");
}

function renderTables(now) {
    if (!elSched) return;
    const sched = SCHEDULES[viewKey];
    const markNext = viewKey === todayKey();

    elSched.innerHTML = ["toCampus", "toDorms"]
        .map((id) => {
            const dir = sched.dirs[id];
            const data = trips(sched, dir);
            const showVeh = hasVehicles(dir);
            const up = markNext ? data.all.find((t) => t.mins >= now) : null;
            const nextMins = up ? up.mins : null;
            return `
            <section class="sched-col" data-dir="${dir.id}">
                <header class="sched-head">
                    <h2 class="sched-h2">${dir.label}</h2>
                    <p class="sched-route">${dir.stops.join("  →  ")}</p>
                </header>
                ${data.blocks.map((b) => renderTable(dir, b, now, showVeh, nextMins)).join("")}
            </section>`;
        })
        .join("");

    if (elCaveat) {
        elCaveat.innerHTML = sched.caveat || "";
        elCaveat.hidden = !sched.caveat;
    }
}

function renderClock() {
    if (!elClock) return;
    elClock.textContent = new Date()
        .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

let lastMinute = null;
let lastNextKey = null;

function tick(force) {
    const now = nowMinutes();
    if (!force && now === lastMinute) return;
    lastMinute = now;

    renderClock();
    renderNextCards(now);

    const key = nextKey(now);
    if (force || key !== lastNextKey) {
        lastNextKey = key;
        renderTables(now);
    }
}

function renderAll() {
    elNext = document.getElementById("next-wrap");
    elSched = document.getElementById("sched-wrap");
    elClock = document.getElementById("clock");
    elCaveat = document.getElementById("sched-caveat");
    elToday = document.getElementById("day-today");
    tick(true);
}

function setRoad(dirId) {
    const el = document.getElementById("road");
    if (!el) return;
    const dir = DIRS[dirId];
    if (!dir) return;
    const [from, ...rest] = dir.stops;
    el.innerHTML = `<span class="from">${from}</span>` +
        rest.map((s) => `<span class="arw">→</span><span class="via">${s}</span>`).join("");
}

function bindDirToggle() {
    const btns = document.querySelectorAll("[data-show]");
    btns.forEach((btn) => {
        btn.addEventListener("click", () => {
            btns.forEach((b) => b.classList.toggle("on", b === btn));
            document.body.dataset.dir = btn.dataset.show;
            setRoad(btn.dataset.show);
        });
    });
    setRoad(document.body.dataset.dir || "toCampus");
}

function bindDayToggle() {
    const btns = Array.from(document.querySelectorAll("[data-day]"));
    const paint = () => {
        btns.forEach((b) => b.classList.toggle("on", b.dataset.day === viewKey));
        if (elToday) {
            elToday.textContent = viewKey === todayKey()
                ? "today"
                : `today is ${SCHEDULES[todayKey()].label}`;
        }
    };
    btns.forEach((btn) => {
        btn.addEventListener("click", () => {
            viewKey = btn.dataset.day;
            paint();
            renderTables(nowMinutes());
        });
    });
    paint();
}

function bindLocationToggle() {
    const btns = Array.from(document.querySelectorAll("[data-loc]"));
    const paint = () => {
        btns.forEach((b) => b.classList.toggle("on", b.dataset.loc === currentLoc));
    };
    btns.forEach((btn) => {
        btn.addEventListener("click", () => {
            currentLoc = btn.dataset.loc;
            localStorage.setItem("bus-perspective", currentLoc);
            paint();
            tick(true);
        });
    });
    paint();
}

function scrollToNext() {
    const visible = (el) => el && el.offsetParent !== null;

    const rows = Array.from(document.querySelectorAll(".sched tr.next"));
    let target = rows.find(visible);

    if (!target) {
        target = Array.from(document.querySelectorAll(".sched-col")).find(visible);
    }
    if (!target) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rect = target.getBoundingClientRect();
    const y = rect.top + window.pageYOffset - window.innerHeight / 2 + rect.height / 2;

    window.scrollTo({ top: Math.max(0, y), behavior: reduce ? "auto" : "smooth" });

    target.classList.remove("flash");
    void target.offsetWidth;
    target.classList.add("flash");
}

renderAll();
bindDirToggle();
bindDayToggle();
bindLocationToggle();
document.getElementById("jump-next")?.addEventListener("click", scrollToNext);

setInterval(tick, 1000);

document.addEventListener("visibilitychange", () => {
    if (!document.hidden) tick(true);
});
window.addEventListener("pageshow", () => tick(true));
window.addEventListener("focus", () => tick(true));
window.addEventListener("online", () => tick(true));
