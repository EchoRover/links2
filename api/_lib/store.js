// Upstash Redis over REST (same env fallbacks as api/report.js) plus the
// override store: one hash, field = op id, value = op JSON.
import { createHash } from "node:crypto";

const URL_ = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const HASH = "linkeen:ops";

export function configured() {
  return Boolean(URL_ && TOKEN);
}

export async function redis(...cmd) {
  const r = await fetch(URL_, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
  });
  if (!r.ok) throw new Error(`redis ${r.status}`);
  return (await r.json()).result;
}

export function todayDubai() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Dubai" });
}

// Active ops, oldest first. Expiry is inclusive: an op is live through its
// `expires` date. Expired ones are removed lazily here.
export async function listActive() {
  const flat = (await redis("HGETALL", HASH)) || [];
  const today = todayDubai();
  const ops = [];
  const dead = [];
  for (let i = 0; i < flat.length; i += 2) {
    let op;
    try { op = JSON.parse(flat[i + 1]); } catch { dead.push(flat[i]); continue; }
    if (op.expires && op.expires < today) dead.push(flat[i]);
    else ops.push(op);
  }
  if (dead.length) redis("HDEL", HASH, ...dead).catch(() => {});
  ops.sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
  return ops;
}

export async function putOp(op) {
  await redis("HSET", HASH, op.id, JSON.stringify(op));
}

export async function delOp(id) {
  return redis("HDEL", HASH, id);
}

export function rev(ops) {
  return createHash("sha256").update(ops.map((o) => o.id).join(",")).digest("hex").slice(0, 8);
}
