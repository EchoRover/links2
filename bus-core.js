// ============================================================
// bus-core.js — shuttle schedule data and pure helpers, shared by
// /bus (bus.js) and the next-bus card on the home page (bus-next.js).
// No DOM here. See bus.js for the route notes.
// ============================================================

const DAY_ROTA = ["Coaster 1", "Coaster 2", "Coaster 3", "Bus 1", "Bus 2", "Bus 3", "Coaster 4"];

// Weekend: start + interval are from the notice.
const WEEKEND_START = "07:30";
const WEEKEND_NOTICE_UNTIL = "18:30";   // where the confirmed block ends
const WEEKEND_LAST = "23:30";           // ASSUMED
const WEEKEND_STEP = 30;


const DIRS = {
    toCampus: {
        id: "toCampus",
        label: "Dorms → Campus",
        short: "➔ Campus",
        from: "KCA 1&2",
        stops: ["KCA 1&2", "KCA 3", "Campus"],
    },
    toDorms: {
        id: "toDorms",
        label: "Campus → Dorms",
        short: "➔ Dorms",
        from: "Campus",
        stops: ["Campus", "KCA 1&2", "KCA 3"],
    },
    kca3Loop: {
        id: "kca3Loop",
        label: "KCA 3 ⇄ KCA 1 Shuttle",
        short: "➔ KCA 1 / 3",
        from: "KCA 3",
        stops: ["KCA 3", "KCA 1&2", "KCA 3"],
    }
};

const DESTINATIONS = {
    kca1: [
        { id: "campus", label: "Campus" },
        { id: "kca3", label: "KCA 3" }
    ],
    kca3: [
        { id: "campus", label: "Campus" },
        { id: "kca1", label: "KCA 1&2" }
    ],
    campus: [
        { id: "kca1", label: "KCA 1&2" },
        { id: "kca3", label: "KCA 3" }
    ]
};

const ITINERARIES = {
    // ---------- From KCA 1&2 ----------
    "kca1->campus": [
        {
            dirId: "toCampus",
            originOffset: 0,
            destOffset: 15,
            desc: "Dorms → Campus Shuttle"
        }
    ],
    "kca1->kca3": [
        {
            dirId: "toCampus",
            originOffset: 0,
            destOffset: 5,
            desc: "Dorms → Campus Shuttle (stops at KCA 3)"
        },
        {
            dirId: "kca3Loop",
            originOffset: 10,
            destOffset: 20,
            desc: "KCA 3 ⇄ KCA 1 Night Shuttle"
        }
    ],
    
    // ---------- From KCA 3 ----------
    "kca3->campus": [
        {
            dirId: "toCampus",
            originOffset: 5,
            destOffset: 15,
            desc: "Dorms → Campus Shuttle"
        }
    ],
    "kca3->kca1": [
        {
            dirId: "toDorms",
            originOffset: 20,
            destOffset: 25,
            desc: "Campus ➔ Dorms Shuttle (returning to KCA 1&2)"
        },
        {
            dirId: "kca3Loop",
            originOffset: 0,
            destOffset: 10,
            desc: "KCA 3 ⇄ KCA 1 Night Shuttle"
        }
    ],
    
    // ---------- From Campus ----------
    "campus->kca1": [
        {
            dirId: "toDorms",
            originOffset: 0,
            destOffset: 15,
            desc: "Campus → Dorms Shuttle"
        }
    ],
    "campus->kca3": [
        {
            dirId: "toDorms",
            originOffset: 0,
            destOffset: 20,
            desc: "Campus → Dorms Shuttle"
        }
    ]
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
        numbering: "perBlock",
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
            kca3Loop: {
                ...DIRS.kca3Loop,
                blocks: [
                    {
                        title: "KCA 3 ⇄ KCA 1 Shuttle", tag: "dorms shuttle", tagTone: "night", dashed: true,
                        rota: ["Coaster 4"],
                        times: [
                            "19:00", "19:20", "19:40", "20:00", "20:20", "20:40", "21:00",
                            "21:40", "22:00", "22:20", "22:40", "23:00", "23:20", "23:40"
                        ]
                    }
                ]
            }
        },
    },

    // ---------- Sat–Sun: the notice ----------
    weekend: {
        key: "weekend",
        label: "Sat & Sun",
        short: "Sat & Sun",
        numbering: "continuous",
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

// ---------- one-off dated timetables ----------
// A notice that replaces the service for ONE date. dayKey() checks `date`
// before the weekday rules, so the page and the home card switch on that day
// and fall back the day after. Ported from linkcs (EchoRover/links e963ea4).

// Transport office sheet headed "24-10-26", sent 2026-10-23: "As exams are
// scheduled for tomorrow, please follow the above transport schedule
// accordingly." It ends at 6:40 PM both ways and lists no night runs.
const EXAM_1024_FOUR = ["Bus 1", "Bus 3", "Coaster 1", "Coaster 4"];
const EXAM_1024_FIVE = ["VAN 1", "Bus 1", "Bus 3", "Coaster 1", "Coaster 4"];

SCHEDULES["exam-2026-10-24"] = {
    key: "exam-2026-10-24",
    date: "2026-10-24",
    label: "Sat 24 Oct · exams",
    short: "Sat 24 Oct",
    numbering: "continuous",
    caveat: "<strong>Exam day, Sat 24 Oct.</strong> The transport office's one-day sheet: "
        + "“As exams are scheduled for tomorrow, please follow the above transport schedule "
        + "accordingly.” Last run 6:40 PM both ways; the sheet lists nothing after that.",
    dirs: {
        toCampus: {
            ...DIRS.toCampus,
            blocks: [{
                title: "Exam day — 24 Oct sheet", tag: "exam day", tagTone: "day",
                rota: [
                    ...EXAM_1024_FOUR, ...EXAM_1024_FOUR, ...EXAM_1024_FOUR,
                    ...Array(6).fill(EXAM_1024_FIVE).flat().slice(0, 26),
                ],
                times: [
                    "07:00", "07:20", "07:40",
                    ...everyN("08:00", "10:00", 15),
                    ...everyN("10:20", "18:40", 20),
                ],
            }],
        },
        toDorms: {
            ...DIRS.toDorms,
            blocks: [{
                title: "Exam day — 24 Oct sheet", tag: "exam day", tagTone: "day",
                rota: [
                    ...EXAM_1024_FOUR, ...EXAM_1024_FOUR, ...EXAM_1024_FOUR,
                    ...Array(6).fill(EXAM_1024_FIVE).flat().slice(0, 24),
                ],
                times: [
                    "07:40",
                    ...everyN("08:00", "10:00", 15),
                    ...everyN("10:20", "18:40", 20),
                ],
            }],
        },
    },
};

// "2026-10-24" in the device's own timezone, matching getDay().
function isoDate(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ---------- helpers ----------

function toMinutes(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
}

function to12h(hhmm) {
    let [h, m] = hhmm.split(":").map(Number);
    h = h % 24;
    const suffix = h < 12 ? "AM" : "PM";
    let display = h % 12;
    if (display === 0) display = 12;
    return `${display}:${String(m).padStart(2, "0")} ${suffix}`;
}

function to12hSimple(hhmm) {
    let [h, m] = hhmm.split(":").map(Number);
    h = h % 24;
    let display = h % 12;
    if (display === 0) display = 12;
    return `${display}:${String(m).padStart(2, "0")}`;
}

function addMins(hhmm, offset) {
    const mins = toMinutes(hhmm) + offset;
    const h = Math.floor(mins / 60) % 24;
    const m = mins % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function dayKey(d) {
    const iso = isoDate(d);
    const dated = Object.values(SCHEDULES).find((s) => s.date === iso);
    if (dated) return dated.key;
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

function nowMinutes() {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
}

function untilLabel(mins, now) {
    let delta = mins - now;
    if (delta < 0) delta += 24 * 60;
    if (delta === 0) return "now";
    if (delta < 60) return `${delta} min`;
    const h = Math.floor(delta / 60);
    const m = delta % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
}

// Get structured vehicle attributes (name, type, icon)
function getVehicleDetail(vehicle) {
    if (!vehicle) return null;
    const v = vehicle.toLowerCase();
    let type = "Shuttle";
    let icon = "🚍";
    let className = "tag-day";
    
    if (v.includes("coaster")) {
        type = "Coaster";
        icon = "🚍";
        className = "tag-day";
    } else if (v.includes("van")) {
        type = "Van";
        icon = "🚐";
        className = "tag-night";
    } else if (v.includes("bus")) {
        type = "Large Bus";
        icon = "🚌";
        className = "tag-day";
    }
    
    return {
        name: vehicle,
        type: type,
        icon: icon,
        className: className
    };
}

// Get the unified list of trips matching the active location -> destination itinerary
function getItineraryTrips(sched, loc, dest) {
    const key = `${loc}->${dest}`;
    const configs = ITINERARIES[key] || [];
    let rows = [];

    const isFriday = new Date().getDay() === 5;

    configs.forEach(cfg => {
        const dir = sched.dirs[cfg.dirId];
        if (!dir) return;

        dir.blocks.forEach(b => {
            let times = b.times;

            // Filter out Friday prayer times on Fridays:
            if (isFriday && sched.key === "weekday") {
                times = times.filter(t => {
                    const mins = toMinutes(t);
                    return mins < 750 || mins > 795;
                });
            }

            times.forEach((t, i) => {
                const baseMins = toMinutes(t);
                const departMins = baseMins + cfg.originOffset;
                const arriveMins = baseMins + cfg.destOffset;

                const departH = Math.floor(departMins / 60) % 24;
                const departM = departMins % 60;
                const departTime = `${String(departH).padStart(2, "0")}:${String(departM).padStart(2, "0")}`;

                const arriveH = Math.floor(arriveMins / 60) % 24;
                const arriveM = arriveMins % 60;
                const arriveTime = `${String(arriveH).padStart(2, "0")}:${String(arriveM).padStart(2, "0")}`;

                const vehicle = b.rota ? b.rota[i % b.rota.length] : null;

                rows.push({
                    baseTime: t,
                    departTime: departTime,
                    departMins: departMins,
                    arriveTime: arriveTime,
                    arriveMins: arriveMins,
                    vehicle: vehicle,
                    tag: b.tag || null,
                    tagTone: b.tagTone || "day",
                    assumed: !!b.assumed,
                    desc: cfg.desc,
                    dirId: cfg.dirId
                });
            });
        });
    });

    rows.sort((a, b) => a.departMins - b.departMins);
    return rows;
}

// Next `n` departures for loc -> dest from `now` (minutes since midnight),
// rolling over to tomorrow's schedule when today's has run out.
function nextDepartures(loc, dest, now, n) {
    let upcoming = getItineraryTrips(SCHEDULES[todayKey()], loc, dest)
        .map(t => ({ ...t, tomorrow: false }))
        .filter(t => t.departMins >= now);
    if (upcoming.length === 0) {
        upcoming = getItineraryTrips(SCHEDULES[tomorrowKey()], loc, dest)
            .map(t => ({ ...t, tomorrow: true }));
    }
    return upcoming.slice(0, n);
}
