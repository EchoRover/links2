// Web Push for linkeen. Subscribers live in one Redis hash:
//   field = sha256(endpoint), value = { sub, prefs: { news, deadline, class, group }, at }
// Sends dedupe on `key` (SET NX, 30 days) so the 5-minute scheduler can rerun safely.
import { createHash } from "node:crypto";
import webpush from "web-push";
import { redis } from "./store.js";

const HASH = "linkeen:push";
const TOPICS = ["news", "deadline", "class", "manual"];

export const vapidPublic = () => (process.env.VAPID_PUBLIC_KEY || "").trim();
export const pushReady = () => Boolean(vapidPublic() && process.env.VAPID_PRIVATE_KEY);

const idOf = (endpoint) => createHash("sha256").update(endpoint).digest("hex").slice(0, 32);

export function cleanSub(sub) {
  const ep = String(sub?.endpoint || "");
  const k = sub?.keys || {};
  if (!/^https:\/\/[^\s]{10,800}$/.test(ep) || typeof k.p256dh !== "string" || typeof k.auth !== "string") {
    throw new Error("bad subscription");
  }
  return { endpoint: ep, keys: { p256dh: k.p256dh.slice(0, 200), auth: k.auth.slice(0, 100) } };
}

export function cleanPrefs(p = {}) {
  const g = Number(p.group);
  // v:2 = chosen with the "class + bus" box on by default; older records predate it and get classes too.
  return { news: p.news !== false, deadline: p.deadline !== false, class: p.class !== false,
           group: g === 1 || g === 2 ? g : 0, v: 2 };
}

const dubaiDay = () => new Date(Date.now() + 4 * 3600e3).toISOString().slice(0, 10);
const HERE = (day) => `linkeen:push:here:${day}`;

// "I'm on campus" for today: bus pings stop for this phone until tomorrow.
export async function markHere(endpoint) {
  const key = HERE(dubaiDay());
  await redis("SADD", key, idOf(String(endpoint || "")));
  await redis("EXPIRE", key, "172800");
}

// The service worker resends a rotated subscription with `old` and no prefs: carry the old prefs over.
export async function saveSub(sub, prefs, old) {
  if (old && old !== sub.endpoint) {
    if (!prefs) {
      try { prefs = JSON.parse(await redis("HGET", HASH, idOf(old))).prefs; } catch { /* none stored */ }
    }
    await redis("HDEL", HASH, idOf(old));
  }
  prefs = cleanPrefs(prefs || {});
  await redis("HSET", HASH, idOf(sub.endpoint), JSON.stringify({ sub, prefs, at: new Date().toISOString() }));
}

export async function dropSub(endpoint) {
  return redis("HDEL", HASH, idOf(String(endpoint || "")));
}

// "Send me a test" from the bell: one push to this phone only, at most once a minute.
export async function sendTest(endpoint) {
  const id = idOf(String(endpoint || ""));
  const raw = await redis("HGET", HASH, id);
  if (!raw) return { ok: false, error: "this phone isn't subscribed; tap Turn on first" };
  if (!(await redis("SET", `linkeen:push:test:${id}`, "1", "NX", "EX", "60"))) return { ok: false, error: "wait a minute between tests" };
  webpush.setVapidDetails("https://linkeen.vercel.app", vapidPublic(), process.env.VAPID_PRIVATE_KEY);
  try {
    await webpush.sendNotification(JSON.parse(raw).sub, JSON.stringify({ title: "Test: notifications work",
      body: "You'll get class, bus and deadline pings like this one.", url: "/", tag: "test", topic: "class" }),
      { TTL: 300, urgency: "high" });
    return { ok: true };
  } catch (e) {
    if (e.statusCode === 404 || e.statusCode === 410) await redis("HDEL", HASH, id);
    return { ok: false, error: `push service said ${e.statusCode || e.message}; tap Save to re-subscribe` };
  }
}

// msg: { title, body, url, topic, group?, key?, skipHere? (true = skip phones marked on campus today) }
export async function broadcast(msg) {
  const topic = TOPICS.includes(msg.topic) ? msg.topic : "manual";
  if (msg.key) {
    const fresh = await redis("SET", `linkeen:push:sent:${String(msg.key).slice(0, 120)}`, "1", "NX", "EX", "2592000");
    if (!fresh) return { skipped: "already sent" };
  }
  webpush.setVapidDetails("https://linkeen.vercel.app", vapidPublic(), process.env.VAPID_PRIVATE_KEY);
  const payload = JSON.stringify({ title: String(msg.title).slice(0, 80), body: String(msg.body || "").slice(0, 240),
                                   url: String(msg.url || "/").slice(0, 200), tag: msg.key || topic, topic });
  const flat = (await redis("HGETALL", HASH)) || [];
  const here = msg.skipHere ? new Set((await redis("SMEMBERS", HERE(dubaiDay()))) || []) : null;
  let sent = 0, gone = 0, failed = 0;
  const jobs = [];
  for (let i = 0; i < flat.length; i += 2) {
    let rec;
    try { rec = JSON.parse(flat[i + 1]); } catch { continue; }
    const p = rec.prefs || {};
    if (topic !== "manual" && !(p[topic] || (topic === "class" && !p.v))) continue;
    if (here && here.has(flat[i])) continue;
    if (topic === "class" && msg.group && p.group && p.group !== msg.group) continue;
    const field = flat[i];
    jobs.push(webpush.sendNotification(rec.sub, payload, { TTL: topic === "class" ? 900 : 86400, urgency: "high" })
      .then(() => { sent++; })
      .catch((e) => {
        if (e.statusCode === 404 || e.statusCode === 410) { gone++; return redis("HDEL", HASH, field); }
        failed++;
      }));
  }
  await Promise.all(jobs);
  return { sent, gone, failed };
}
