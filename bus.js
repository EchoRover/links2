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
// KCA 1&2 -> KCA 3 is 5 min (was coded as 3, giving times like 8:43).
// Times are stored as "HH:MM" 24h for math, rendered as 12h.
// ============================================================

// Schedule data and helpers live in bus-core.js (loaded first).

let currentLoc = localStorage.getItem("bus-perspective") || "kca1";
let currentDest = localStorage.getItem("bus-destination") || "campus";

// ---------- live departures board ----------

function getUpcomingItineraryDepartures(now) {
    return nextDepartures(currentLoc, currentDest, now, 4);
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
            { name: "KCA 3", time: addMins(active.baseTime, 5), offset: 5 },
            { name: "Campus", time: addMins(active.baseTime, 15), offset: 15 }
        ];
    } else if (active.dirId === "toDorms") {
        stops = [
            { name: "Campus", time: active.baseTime, offset: 0 },
            { name: "KCA 1&2", time: addMins(active.baseTime, 15), offset: 15 },
            { name: "KCA 3", time: addMins(active.baseTime, 20), offset: 20 }
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
            let vehTag = "";
            const vDetail = getVehicleDetail(t.vehicle);
            if (vDetail) {
                vehTag = `<span class="board-veh-tag tag ${vDetail.className}">${vDetail.icon} ${vDetail.name} <small style="opacity: 0.85; font-weight: 500;">(${vDetail.type})</small></span>`;
            } else if (t.assumed) {
                vehTag = `<span class="board-veh-tag tag tag-soft">❓ Assumed Shuttle</span>`;
            }
            
            const originLabel = currentLoc === "kca1" ? "KCA 1&2" : currentLoc === "kca3" ? "KCA 3" : "Campus";
            const destLabel = currentDest === "kca1" ? "KCA 1&2" : currentDest === "kca3" ? "KCA 3" : "Campus";

            return `
            <div class="board-item">
                <div class="item-time-eta">
                    <span class="item-eta">${until}</span>
                    <span class="item-time">${to12h(t.departTime)}</span>
                </div>
                <div class="item-details">
                    <div class="item-route-line">
                        <span class="item-dest">Departs ${originLabel} ➔ Arrives ${destLabel} at ${to12hSimple(t.arriveTime)}</span>
                        ${vehTag}
                    </div>
                    <div class="item-timeline" style="margin-top: 0.25rem; color: var(--fg-soft); font-size: 0.72rem;">
                        ${t.desc}
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
    const target = document.getElementById("next-row");
    if (!target) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rect = target.getBoundingClientRect();
    const y = rect.top + window.pageYOffset - window.innerHeight / 2 + rect.height / 2;

    window.scrollTo({ top: Math.max(0, y), behavior: reduce ? "auto" : "smooth" });

    target.classList.remove("flash");
    void target.offsetWidth;
    target.classList.add("flash");
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
