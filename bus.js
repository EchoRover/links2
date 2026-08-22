// ============================================================
// BUS / VAN SHUTTLE SCHEDULE — KCA 1&2 · KCA 3 · Campus
//
// The loop is one clockwise cycle:
//     KCA 1&2  ->  KCA 3  ->  Campus  ->  KCA 1&2  ->  ...
// so "Dorms to Campus" departs KCA 1&2 and "Campus to Dorms"
// departs Campus. KCA 3 is the middle stop on BOTH legs.
//
// Dedicated Dorm Shuttle:
//   Mon-Fri night shift includes a dedicated KCA 3 ⇄ KCA 1 shuttle
//   operated by Coaster 4 from 7:00 PM to 11:40 PM (KCA3 -> KCA1 -> KCA3).
//
// Times are stored as "HH:MM" 24h for math, rendered as 12h.
// ============================================================

const DAY_ROTA = ["Coaster 1", "Coaster 2", "Coaster 3", "Bus 1", "Bus 2", "Bus 3", "Coaster 4"];

// Weekend: start + interval are from the notice.
const WEEKEND_START = "07:30";
const WEEKEND_NOTICE_UNTIL = "18:30";   // where the confirmed block ends
const WEEKEND_LAST = "23:30";           // ASSUMED
const WEEKEND_STEP = 30;

let currentLoc = localStorage.getItem("bus-perspective") || "kca1";
let currentDest = localStorage.getItem("bus-destination") || "campus";

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
            desc: "Dorms ➔ Campus Shuttle"
        }
    ],
    "kca1->kca3": [
        {
            dirId: "toCampus",
            originOffset: 0,
            destOffset: 3,
            desc: "Dorms ➔ Campus Shuttle (stops at KCA 3)"
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
            originOffset: 3,
            destOffset: 15,
            desc: "Dorms ➔ Campus Shuttle"
        }
    ],
    "kca3->kca1": [
        {
            dirId: "toDorms",
            originOffset: 18,
            destOffset: 21,
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
            desc: "Campus ➔ Dorms Shuttle"
        }
    ],
    "campus->kca3": [
        {
            dirId: "toDorms",
            originOffset: 0,
            destOffset: 18,
            desc: "Campus ➔ Dorms Shuttle"
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

// Get the list of trips matching the active location -> destination itinerary
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

// ---------- live departures board ----------

function getUpcomingItineraryDepartures(now) {
    const sched = SCHEDULES[todayKey()];
    let upcoming = getItineraryTrips(sched, currentLoc, currentDest)
        .map(t => ({ ...t, tomorrow: false }))
        .filter(t => t.departMins >= now);

    if (upcoming.length === 0) {
        const tom = tomorrowKey();
        const tomSched = SCHEDULES[tom];
        upcoming = getItineraryTrips(tomSched, currentLoc, currentDest)
            .map(t => ({ ...t, tomorrow: true }));
    }

    return upcoming.slice(0, 4);
}

// ---------- active transit tracker ----------

function getActiveTransitTrip(now) {
    const today = todayKey();
    const sched = SCHEDULES[today];
    if (sched.key === "weekend") return null;

    for (const dirId of ["toCampus", "toDorms", "kca3Loop"]) {
        const dir = sched.dirs[dirId];
        if (!dir) continue;

        const isFriday = new Date().getDay() === 5;
        
        for (const b of dir.blocks) {
            let times = b.times;
            if (isFriday) {
                times = times.filter(t => {
                    const mins = toMinutes(t);
                    return mins < 750 || mins > 795;
                });
            }

            for (let i = 0; i < times.length; i++) {
                const t = times[i];
                const startMins = toMinutes(t);
                let duration = 0;
                if (dirId === "toCampus") duration = 15;
                else if (dirId === "toDorms") duration = 18;
                else if (dirId === "kca3Loop") duration = 20;

                const endMins = startMins + duration;
                if (now >= startMins && now < endMins) {
                    const vehicle = b.rota ? b.rota[i % b.rota.length] : null;
                    return {
                        baseTime: t,
                        dirId: dirId,
                        startMins: startMins,
                        endMins: endMins,
                        duration: duration,
                        progress: ((now - startMins) / duration) * 100,
                        vehicle: vehicle,
                        dirLabel: dir.label
                    };
                }
            }
        }
    }
    return null;
}

// ---------- rendering ----------

function renderActiveTracker(now) {
    const active = getActiveTransitTrip(now);
    const container = document.getElementById("active-tracker-wrap");
    if (!container) return;

    if (!active) {
        container.innerHTML = "";
        container.style.display = "none";
        return;
    }

    container.style.display = "block";
    let stops = [];
    if (active.dirId === "toCampus") {
        stops = [
            { name: "KCA 1&2", time: active.baseTime, offset: 0 },
            { name: "KCA 3", time: addMins(active.baseTime, 3), offset: 3 },
            { name: "Campus", time: addMins(active.baseTime, 15), offset: 15 }
        ];
    } else if (active.dirId === "toDorms") {
        stops = [
            { name: "Campus", time: active.baseTime, offset: 0 },
            { name: "KCA 1&2", time: addMins(active.baseTime, 15), offset: 15 },
            { name: "KCA 3", time: addMins(active.baseTime, 18), offset: 18 }
        ];
    } else if (active.dirId === "kca3Loop") {
        stops = [
            { name: "KCA 3", time: active.baseTime, offset: 0 },
            { name: "KCA 1&2", time: addMins(active.baseTime, 10), offset: 10 },
            { name: "KCA 3", time: addMins(active.baseTime, 20), offset: 20 }
        ];
    }

    const stopsHtml = stops.map((s) => {
        const stopMins = active.startMins + s.offset;
        let cls = "";
        if (now > stopMins) cls = "passed";
        else if (now === stopMins || (now < stopMins && now >= stopMins - 2)) cls = "active";
        
        return `
        <div class="map-stop ${cls}">
            <span class="stop-dot"></span>
            <span class="stop-name">${s.name}</span>
            <span class="stop-time">${to12hSimple(s.time)}</span>
        </div>`;
    }).join("");

    const vDetail = getVehicleDetail(active.vehicle);
    const vehName = vDetail ? `${vDetail.icon} ${vDetail.name} (${vDetail.type})` : "Shuttle";

    container.innerHTML = `
    <div class="tracker-card">
        <div class="tracker-status">
            <span class="pulse-dot"></span>
            <span class="status-text">Active: ${vehName} in transit (${active.dirLabel})</span>
        </div>
        <div class="tracker-map">
            <div class="map-line">
                <div class="map-progress" style="width: ${active.progress}%;"></div>
                <div class="map-bus" style="left: ${active.progress}%;">🚌</div>
            </div>
            <div class="map-stops">
                ${stopsHtml}
            </div>
        </div>
    </div>`;
}

function renderLiveBoard(now) {
    if (!elNext) return;
    const upcoming = getUpcomingItineraryDepartures(now);

    let html = "";
    if (upcoming.length === 0) {
        html = `<div class="board-empty">No departures scheduled for this route.</div>`;
    } else {
        html = upcoming.map((t) => {
            const until = t.tomorrow ? "tomorrow" : untilLabel(t.departMins, now);
            const vDetail = getVehicleDetail(t.vehicle);
            
            let iconClass = "assumed";
            let iconEmoji = "❓";
            let vehicleLabel = "Assumed Shuttle";
            
            if (vDetail) {
                iconEmoji = vDetail.icon;
                vehicleLabel = `${vDetail.name} (${vDetail.type})`;
                if (vDetail.type === "Coaster") iconClass = "coaster";
                else if (vDetail.type === "Van") iconClass = "van";
                else if (vDetail.type === "Large Bus") iconClass = "bus";
            }

            const originLabel = currentLoc === "kca1" ? "KCA 1&2" : currentLoc === "kca3" ? "KCA 3" : "Campus";
            const destLabel = currentDest === "kca1" ? "KCA 1&2" : currentDest === "kca3" ? "KCA 3" : "Campus";

            return `
            <div class="board-item-card">
                <div class="veh-icon-circle ${iconClass}">${iconEmoji}</div>
                <div class="card-body">
                    <div class="card-title-row">
                        <span class="card-route-title">Departs ${originLabel} ➔ Arrives ${destLabel}</span>
                        <span class="card-eta">${until}</span>
                    </div>
                    <div class="card-subtitle-row">
                        <span class="card-veh-name">${vehicleLabel}</span>
                        <span class="card-time-badge">⏱️ ${to12h(t.departTime)} &ndash; ${to12hSimple(t.arriveTime)}</span>
                    </div>
                    <div class="card-timeline-desc">
                        🧭 ${t.desc}
                    </div>
                </div>
            </div>`;
        }).join("");
    }

    elNext.innerHTML = html;
}

function renderTables(now) {
    if (!elSched) return;
    const sched = SCHEDULES[viewKey];
    const markNext = viewKey === todayKey();

    const tripsData = getItineraryTrips(sched, currentLoc, currentDest);
    const nextTrip = markNext ? tripsData.find(t => t.departMins >= now) : null;
    const nextMins = nextTrip ? nextTrip.departMins : null;

    const originLabel = currentLoc === "kca1" ? "KCA 1&2" : currentLoc === "kca3" ? "KCA 3" : "Campus";
    const destLabel = currentDest === "kca1" ? "KCA 1&2" : currentDest === "kca3" ? "KCA 3" : "Campus";

    let html = "";
    if (tripsData.length === 0) {
        html = `<div class="board-empty">No shuttle service operates on this route on ${sched.label}.</div>`;
    } else {
        html = `
        <section class="sched-col">
            <header class="sched-head">
                <h2 class="sched-h2">${originLabel} ➔ ${destLabel}</h2>
                <p class="sched-route">Timetable for ${sched.label}</p>
            </header>
            <div class="sched-block">
                <div class="sched-scroll">
                    <table class="sched">
                        <thead>
                            <tr>
                                <th class="c-no">#</th>
                                <th class="c-time">Departs ${originLabel}</th>
                                <th class="c-time">Arrives ${destLabel}</th>
                                <th class="c-veh">Vehicle</th>
                                <th class="c-route">Service / Route</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tripsData.map((t, idx) => {
                                const past = nextMins !== null && t.departMins < now;
                                const isNext = nextMins !== null && t.departMins === nextMins;
                                const cls = [past ? "past" : "", isNext ? "next" : ""].filter(Boolean).join(" ");
                                
                                const vDetail = getVehicleDetail(t.vehicle);
                                let vehHtml = "—";
                                if (vDetail) {
                                    vehHtml = `<span class="tag ${vDetail.className}" style="font-family: var(--font-sans); font-weight: 600; font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 6px; display: inline-flex; align-items: center; gap: 0.25rem;">${vDetail.icon} ${vDetail.name} <small style="opacity: 0.85; font-weight: 500;">(${vDetail.type})</small></span>`;
                                } else if (t.assumed) {
                                    vehHtml = `<span class="tag tag-soft" style="font-size: 0.68rem; padding: 0.2rem 0.5rem; border-radius: 6px;">Assumed</span>`;
                                }

                                return `
                                <tr class="${cls}"${isNext ? ' id="next-row"' : ""}>
                                    <td class="c-no">${idx + 1}</td>
                                    <td class="c-time">${to12h(t.departTime)}</td>
                                    <td class="c-time">${to12h(t.arriveTime)}</td>
                                    <td class="c-veh">${vehHtml}</td>
                                    <td class="c-route" style="font-size: 0.72rem;">${t.desc}</td>
                                </tr>`;
                            }).join("")}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>`;
    }

    elSched.innerHTML = html;

    if (elCaveat) {
        elCaveat.innerHTML = sched.caveat || "";
        elCaveat.hidden = !sched.caveat;
    }
}

// Compute active status chip values
function getServiceStatus(now) {
    const today = todayKey();
    const isFriday = new Date().getDay() === 5;
    
    if (isFriday && now >= 750 && now <= 795) {
        return {
            text: "Friday Prayer Break",
            class: "prayer-break"
        };
    }
    
    if (today === "weekend") {
        if (now < 450 || now > 1410) {
            return {
                text: "Off Duty",
                class: "off-duty"
            };
        }
        return {
            text: "Weekend Service Active",
            class: "active-day"
        };
    } else {
        if (now < 420 || now > 1440) {
            return {
                text: "Off Duty",
                class: "off-duty"
            };
        }
        if (now >= 1140) {
            return {
                text: "Night Shuttle Active",
                class: "active-night"
            };
        }
        return {
            text: "Day Service Active",
            class: "active-day"
        };
    }
}

function updateStatusChip(now) {
    const el = document.getElementById("status-chip");
    if (!el) return;
    const status = getServiceStatus(now);
    el.textContent = status.text;
    el.className = `status-chip ${status.class}`;
}

let elNext, elSched, elClock, elCaveat, elToday;

let viewKey = todayKey();

function renderClock() {
    if (!elClock) return;
    elClock.textContent = new Date()
        .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

let lastMinute = null;

function tick(force) {
    const now = nowMinutes();
    if (!force && now === lastMinute) return;
    lastMinute = now;

    renderClock();
    updateStatusChip(now);
    renderActiveTracker(now);
    renderLiveBoard(now);
    renderTables(now);
}

function renderAll() {
    elNext = document.getElementById("next-wrap");
    elSched = document.getElementById("sched-wrap");
    elClock = document.getElementById("clock");
    elCaveat = document.getElementById("sched-caveat");
    elToday = document.getElementById("day-today");
    tick(true);
}

function populateDestinations() {
    const el = document.getElementById("dest-seg");
    if (!el) return;
    
    const options = DESTINATIONS[currentLoc] || [];
    if (!options.some(opt => opt.id === currentDest)) {
        currentDest = options[0].id;
        localStorage.setItem("bus-destination", currentDest);
    }
    
    el.innerHTML = options.map(opt => `
        <button type="button" data-dest="${opt.id}" class="${opt.id === currentDest ? "on" : ""}">${opt.label}</button>
    `).join("");
    
    el.querySelectorAll("[data-dest]").forEach(btn => {
        btn.addEventListener("click", () => {
            currentDest = btn.dataset.dest;
            localStorage.setItem("bus-destination", currentDest);
            el.querySelectorAll("[data-dest]").forEach(b => b.classList.toggle("on", b === btn));
            tick(true);
        });
    });
}

function bindDayToggle() {
    const btns = Array.from(document.querySelectorAll("[data-day]"));
    const paint = () => {
        btns.forEach((b) => b.classList.toggle("on", b.dataset.day === viewKey));
        if (elToday) {
            elToday.textContent = viewKey === todayKey()
                ? "Showing today's schedule"
                : `Showing ${SCHEDULES[viewKey].label} schedule (today is ${SCHEDULES[todayKey()].label})`;
        }
    };
    btns.forEach((btn) => {
        btn.addEventListener("click", () => {
            viewKey = btn.dataset.day;
            paint();
            tick(true);
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
            populateDestinations();
            tick(true);
        });
    });
    paint();
}

function swapLocationAndDestination() {
    const temp = currentLoc;
    currentLoc = currentDest;
    currentDest = temp;
    localStorage.setItem("bus-perspective", currentLoc);
    localStorage.setItem("bus-destination", currentDest);
    
    // Repaint Location
    const locBtns = document.querySelectorAll("[data-loc]");
    locBtns.forEach(b => b.classList.toggle("on", b.dataset.loc === currentLoc));
    
    // Repopulate Destination
    populateDestinations();
    
    tick(true);
}

function scrollToNext() {
    const details = document.querySelector(".timetable-details");
    if (details) {
        details.open = true; // Auto-expand collapsible full timetable if closed
    }

    requestAnimationFrame(() => {
        const target = document.getElementById("next-row");
        if (!target) return;

        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const rect = target.getBoundingClientRect();
        const y = rect.top + window.pageYOffset - window.innerHeight / 2 + rect.height / 2;

        window.scrollTo({ top: Math.max(0, y), behavior: reduce ? "auto" : "smooth" });

        target.classList.remove("flash");
        void target.offsetWidth;
        target.classList.add("flash");
    });
}

populateDestinations();
renderAll();
bindDayToggle();
bindLocationToggle();
document.getElementById("swap-btn")?.addEventListener("click", swapLocationAndDestination);
document.getElementById("jump-next")?.addEventListener("click", scrollToNext);

setInterval(tick, 1000);

document.addEventListener("visibilitychange", () => {
    if (!document.hidden) tick(true);
});
window.addEventListener("pageshow", () => tick(true));
window.addEventListener("focus", () => tick(true));
window.addEventListener("online", () => tick(true));
