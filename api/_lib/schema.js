// Whitelist validation for override ops. Runs on every write; whatever the
// LLM produced is rebuilt field by field, so unknown keys never get stored.
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;
const COURSE = /^[A-Z]{4}\d{3}$/;
const LEVELS = ["info", "new", "urgent"];
const MEALS = ["breakfast", "lunch", "dinner"];

const str = (v, n) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, n);

function date(v, name) {
  const s = String(v ?? "").trim();
  const d = new Date(s + "T00:00:00Z");
  if (!DATE.test(s) || isNaN(d) || d.toISOString().slice(0, 10) !== s) throw new Error(`bad ${name}`);
  return s;
}
function time(v, name) {
  const s = String(v ?? "").trim();
  const [h, m] = s.split(":").map(Number);
  if (!TIME.test(s) || h > 23 || m > 59) throw new Error(`bad ${name}`);
  return s;
}
function course(v) {
  const s = String(v ?? "").trim().toUpperCase();
  if (!COURSE.test(s)) throw new Error("bad course");
  return s;
}
function text(v, name, n = 280) {
  const s = str(v, n);
  if (!s) throw new Error(`missing ${name}`);
  return s;
}
function link(v) {
  const s = String(v ?? "").trim();
  if (!s) return undefined;
  if (!/^(https?:\/\/|\/)[^\s"'<>]*$/.test(s) || s.startsWith("//")) throw new Error("bad link");
  return s.slice(0, 300);
}
const opt = (obj, k, v) => { if (v !== undefined && v !== "") obj[k] = v; };

// Returns a clean op (type + fields only). Throws on anything off.
export function validate(op) {
  if (!op || typeof op !== "object") throw new Error("bad op");
  const t = op.type;
  let o;
  switch (t) {
    case "announce": {
      o = { type: t, text: text(op.text, "text"),
            level: LEVELS.includes(op.level) ? op.level : "info",
            until: date(op.until, "until") };
      if (op.from) o.from = date(op.from, "from");
      opt(o, "link", link(op.link));
      break;
    }
    case "holiday":
      o = { type: t, date: date(op.date, "date"), label: text(op.label, "label", 80) };
      break;
    case "makeup": {
      const w = Number(op.followsWeekday);
      if (!Number.isInteger(w) || w < 1 || w > 5) throw new Error("bad followsWeekday");
      o = { type: t, date: date(op.date, "date"), followsWeekday: w };
      break;
    }
    case "class_move": {
      o = { type: t, course: course(op.course),
            fromDate: date(op.fromDate, "fromDate"), fromTime: time(op.fromTime, "fromTime"),
            toDate: date(op.toDate, "toDate"), toTime: time(op.toTime, "toTime"),
            toEnd: time(op.toEnd, "toEnd") };
      if (o.toEnd <= o.toTime) throw new Error("toEnd before toTime");
      opt(o, "room", str(op.room, 20));
      break;
    }
    case "class_cancel": {
      o = { type: t, course: course(op.course), date: date(op.date, "date") };
      if (op.time) o.time = time(op.time, "time");
      break;
    }
    case "exam": {
      o = { type: t, course: course(op.course), kind: text(op.kind, "kind", 20),
            date: date(op.date, "date") };
      if (op.time) o.time = time(op.time, "time");
      opt(o, "room", str(op.room, 20));
      opt(o, "note", str(op.note, 120));
      break;
    }
    case "deadline":
      o = { type: t, course: course(op.course), title: text(op.title, "title", 120),
            date: date(op.date, "date") };
      break;
    case "mess_special": {
      if (!MEALS.includes(op.meal)) throw new Error("bad meal");
      const items = (Array.isArray(op.items) ? op.items : []).map((x) => str(x, 80)).filter(Boolean).slice(0, 12);
      if (!items.length) throw new Error("no items");
      o = { type: t, date: date(op.date, "date"), meal: op.meal, items };
      break;
    }
    default:
      throw new Error("unknown type");
  }
  return o;
}

// Last day (inclusive) the op matters.
export function expiresOf(op) {
  switch (op.type) {
    case "announce": return op.until;
    case "class_move": return op.fromDate > op.toDate ? op.fromDate : op.toDate;
    default: return op.date;
  }
}
