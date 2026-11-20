// Push scheduler, run every minute by .github/workflows/notify-loop.yml.
// Reads the site's own data (timetable.js, scripts.js, announce.js) plus the
// live admin overrides, and asks linkeen-api to send:
//   news      each announcement once, when it first goes live
//   deadline  the evening before (18:00-23:00 Dubai) anything due tomorrow
//   class     ~10 min before each class, filtered by the subscriber's group
//   manual    NOTIFY_TITLE set (workflow_dispatch) -> sent to everyone now
// Every send carries a dedupe key, so reruns never double-ping.
// Env: PUSH_SECRET, LINKEEN_API (default https://linkeen-api.vercel.app), DRY=1 to print only.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ROOT = new URL("../", import.meta.url);
const API = process.env.LINKEEN_API || "https://linkeen-api.vercel.app";
const DRY = process.env.DRY === "1";

// Pull a top-level `const NAME = <literal>;` out of a browser script.
function grab(file, name) {
  const src = readFileSync(new URL(file, ROOT), "utf8");
  const start = src.indexOf(`const ${name} = `);
  if (start < 0) throw new Error(`${name} not in ${file}`);
  // Walk to the matching close bracket, skipping strings and comments.
  let i = src.indexOf("=", start) + 1, depth = 0, opened = false;
  for (; i < src.length; i++) {
    const c = src[i];
    if (c === "/" && src[i + 1] === "/") { i = src.indexOf("\n", i); continue; }
    if (c === "/" && src[i + 1] === "*") { i = src.indexOf("*/", i) + 1; continue; }
    if (c === '"' || c === "'" || c === "`") { while (src[++i] !== c) if (src[i] === "\\") i++; continue; }
    if ("[{(".includes(c)) { depth++; opened = true; }
    if ("]})".includes(c) && --depth === 0 && opened) break;
  }
  return new Function(`return (${src.slice(src.indexOf("=", start) + 1, i + 1)});`)();
}

// Dubai wall clock, whatever the runner's TZ.
const now = new Date(Date.now() + 4 * 3600e3);
const ymdOf = (d) => d.toISOString().slice(0, 10);
const today = ymdOf(now);
const tomorrow = ymdOf(new Date(now.getTime() + 864e5));
const mins = now.getUTCHours() * 60 + now.getUTCMinutes();
const tmin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const strip = (s) => String(s).replace(/<[^>]*>/g, "").replace(/\s*·\s*$/, "").replace(/\s+/g, " ").trim();
const hash = (s) => createHash("sha1").update(s).digest("hex").slice(0, 10);

async function send(msg) {
  if (DRY) { console.log("DRY", JSON.stringify(msg)); return; }
  const r = await fetch(`${API}/api/push/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Push ${process.env.PUSH_SECRET}` },
    body: JSON.stringify(msg),
  });
  console.log(msg.key || "manual", r.status, await r.text());
}

async function overrides() {
  try {
    const r = await fetch(`${API}/api/overrides`, { signal: AbortSignal.timeout(8000) });
    return (await r.json()).ops || [];
  } catch { return []; }
}

const out = [];

// ---- manual broadcast
if (process.env.NOTIFY_TITLE) {
  out.push({ topic: "manual", title: process.env.NOTIFY_TITLE, body: process.env.NOTIFY_BODY || "",
             url: process.env.NOTIFY_URL || "/" });
}

const ops = await overrides();

// ---- announcements: once, the first run after they go live
const quiet = mins < 7 * 60 || mins >= 23 * 60;
if (!quiet) {
  for (const a of grab("announce.js", "ANNOUNCEMENTS")) {
    const until = String(a.until || a.at || "9999").slice(0, 10);
    if ((a.from && a.from > today) || until < today) continue;
    out.push({ topic: "news", title: "linkeen", body: strip(a.text), url: a.link ? "/" + a.link.replace(/^\//, "") : "/",
               key: `ann:${a.id}` });
  }
  for (const o of ops.filter((o) => o.type === "announce")) {
    if ((o.from && o.from > today) || o.until < today) continue;
    out.push({ topic: "news", title: "linkeen", body: strip(o.text), url: "/", key: `op:${o.id}` });
  }
}

// ---- deadlines: the evening before (18:00-23:00), and again the morning of (07:00-12:00)
const dlDay = mins >= 18 * 60 && mins < 23 * 60 ? tomorrow : mins >= 7 * 60 && mins < 12 * 60 ? today : null;
if (dlDay) {
  const due = grab("scripts.js", "updatesData")
    .filter(([, , d]) => d === dlDay)
    .map(([cat, text]) => `${cat === "quizzes" ? "Test" : "Due"}: ${strip(text)}`);
  for (const o of ops) {
    if (o.type === "deadline" && o.date === dlDay) due.push(`Due: ${o.course}: ${o.title}`);
    if (o.type === "exam" && o.date === dlDay) due.push(`Test: ${o.course} ${o.kind}${o.time ? " at " + o.time : ""}`);
  }
  for (const line of due) {
    const t = dlDay === today ? "Today" : "Tomorrow";
    out.push({ topic: "deadline", title: t, body: line, url: "/", key: `dl:${t}:${dlDay}:${hash(line)}` });
  }
}

// ---- classes: starting in the next 15 minutes
const TERM = grab("timetable.js", "TERM");
const NO_CLASS = grab("timetable.js", "NO_CLASS");
const holiday = NO_CLASS[today] || ops.some((o) => o.type === "holiday" && o.date === today);
if (today >= TERM.start && today <= TERM.end && !holiday) {
  const WEEK = grab("timetable.js", "WEEK");
  const COURSES = grab("timetable.js", "COURSES");
  const FOLLOWS = grab("timetable.js", "FOLLOWS");
  const CHANGES = grab("timetable.js", "CLASS_CHANGES");
  const makeup = ops.find((o) => o.type === "makeup" && o.date === today);
  const dow = makeup ? makeup.followsWeekday : (FOLLOWS[today] ?? now.getUTCDay());
  const changes = CHANGES[today] || [];
  const weekly = ops.filter((o) => o.type === "class_weekly" && o.startDate <= today && (!o.endDate || today <= o.endDate));
  const cancel = ops.filter((o) => (o.type === "class_cancel" && o.date === today) || (o.type === "class_move" && o.fromDate === today))
    .map((o) => ({ course: o.course, time: o.time || o.fromTime || "" }))
    .concat(weekly.filter((o) => o.fromTime && o.weekday === dow).map((o) => ({ course: o.course, time: o.fromTime })));
  const list = (WEEK[dow] || []).map(([s, e, code, room, kind, grp]) => {
    const ch = changes.find((c) => c.code === code);
    return { s: ch ? ch.s : s, code, room, kind, grp };
  }).filter((x) => x.kind !== "free" && !cancel.some((c) => c.course === x.code && (!c.time || c.time === x.s)))
    .concat(ops.filter((o) => o.type === "class_move" && o.toDate === today)
      .map((o) => ({ s: o.toTime, code: o.course, room: o.room || "", kind: "", grp: 0 })))
    .concat(weekly.filter((o) => o.toTime && (o.toWeekday || o.weekday) === dow)
      .map((o) => ({ s: o.toTime, code: o.course, room: o.room || "", kind: "", grp: o.group || 0 })));
  const KIND = { lab: "lab", tut: "tutorial", proj: "help session", "": "lecture" };
  for (const x of list) {
    const lead = tmin(x.s) - mins;
    if (lead <= 0 || lead > 15) continue;
    const name = COURSES[x.code]?.name || x.code;
    out.push({ topic: "class", group: x.grp, title: `${x.code} ${KIND[x.kind] || "class"} at ${x.s}`,
               body: `${name}${x.room ? " · " + x.room : ""}${x.grp ? " · G" + x.grp : ""}`, url: "/",
               key: `cls:${today}:${x.s}:${x.code}:${x.grp}` });
  }
}

if (!out.length) console.log(`${today} ${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")} nothing to send`);
for (const m of out) await send(m);
