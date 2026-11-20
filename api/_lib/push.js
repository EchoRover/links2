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
  return { news: p.news !== false, deadline: p.deadline !== false, class: p.class === true,
           group: g === 1 || g === 2 ? g : 0 };
}

export async function saveSub(sub, prefs) {
  await redis("HSET", HASH, idOf(sub.endpoint), JSON.stringify({ sub, prefs, at: new Date().toISOString() }));
}

export async function dropSub(endpoint) {
  return redis("HDEL", HASH, idOf(String(endpoint || "")));
}

// msg: { title, body, url, topic, group?, key? }
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
  let sent = 0, gone = 0, failed = 0;
  const jobs = [];
  for (let i = 0; i < flat.length; i += 2) {
    let rec;
    try { rec = JSON.parse(flat[i + 1]); } catch { continue; }
    const p = rec.prefs || {};
    if (topic !== "manual" && !p[topic]) continue;
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
