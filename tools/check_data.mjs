// Drift guard: the timetable, holidays and make-up days live in several copies (see the
// project notes). This fails (exit 1) when any copy disagrees with timetable.js, so a
// half-done edit never reaches classmates. Run: node tools/check_data.mjs  (CI: check.yml)
import { readFileSync } from "node:fs";

const ROOT = new URL("../", import.meta.url);
const read = (f) => readFileSync(new URL(f, ROOT), "utf8");

// Pull `const NAME = <literal>` out of a browser script or an inline <script>.
function grab(src, name) {
  const st = src.indexOf(`const ${name} = `);
  if (st < 0) throw new Error(`${name} not found`);
  let i = src.indexOf("=", st) + 1, depth = 0, opened = false;
  for (; i < src.length; i++) {
    const c = src[i];
    if (c === "/" && src[i + 1] === "/") { i = src.indexOf("\n", i); continue; }
    if (c === "/" && src[i + 1] === "*") { i = src.indexOf("*/", i) + 1; continue; }
    if (c === '"' || c === "'" || c === "`") { while (src[++i] !== c) if (src[i] === "\\") i++; continue; }
    if ("[{(".includes(c)) { depth++; opened = true; }
    if ("]})".includes(c) && --depth === 0 && opened) break;
  }
  return new Function(`return (${src.slice(src.indexOf("=", st) + 1, i + 1)})`)();
}

// Every copy becomes a set of "weekday CODE HH:MM" strings.
const set = (week, code, start) => new Set(Object.entries(week).flatMap(([d, rows]) =>
  rows.map((r) => `${d} ${code(r)} ${start(r).padStart(5, "0")}`).filter((x) => /A[A-Z]{3}\d{3}/.test(x))));

const tt = read("timetable.js");
const base = set(grab(tt, "WEEK"), (r) => r[2], (r) => r[0]);
const copies = {
  "scripts.js WEEKLY_CLASSES": set(grab(read("scripts.js"), "WEEKLY_CLASSES"), (r) => r.code, (r) => r.time.split("-")[0]),
  "common.js EEN_WEEK": set(grab(read("common.js"), "EEN_WEEK"), (r) => r[2], (r) => r[0]),
  "free.html EEN_WEEK": set(grab(read("free.html"), "EEN_WEEK"), (r) => r.label.split(" ")[0], (r) => r.start),
};

let bad = 0;
const fail = (msg) => { bad++; console.log("FAIL", msg); };
for (const [name, s] of Object.entries(copies)) {
  const missing = [...base].filter((x) => !s.has(x)), extra = [...s].filter((x) => !base.has(x));
  if (missing.length || extra.length) fail(`${name} vs timetable.js WEEK: missing ${missing.join(", ") || "-"}; extra ${extra.join(", ") || "-"}`);
}
const same = (a, b) => JSON.stringify(Object.keys(a).sort()) === JSON.stringify(Object.keys(b).sort());
const sc = read("scripts.js");
if (JSON.stringify(grab(tt, "FOLLOWS")) !== JSON.stringify(grab(sc, "MAKEUP_DAYS"))) fail("timetable.js FOLLOWS != scripts.js MAKEUP_DAYS");
if (!same(grab(tt, "NO_CLASS"), grab(sc, "DAYS_OFF"))) fail("timetable.js NO_CLASS dates != scripts.js DAYS_OFF dates");

console.log(bad ? `${bad} problem(s)` : `OK: ${base.size} class slots agree across ${Object.keys(copies).length + 1} copies; holidays and make-up days match`);
process.exit(bad ? 1 : 0);
