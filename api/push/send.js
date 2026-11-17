// POST /api/push/send {title, body, url, topic, group?, key?}
// Auth: admin login (Bearer/cookie) or `Authorization: Push <PUSH_SECRET>` from the scheduler.
import { createHash, timingSafeEqual } from "node:crypto";
import { configured } from "../_lib/store.js";
import { verify } from "../_lib/auth.js";
import { cors } from "../_lib/cors.js";
import { pushReady, broadcast } from "../_lib/push.js";

function schedulerOk(req) {
  const secret = (process.env.PUSH_SECRET || "").trim();
  const m = String(req.headers.authorization || "").match(/^Push\s+(\S+)$/);
  if (!secret || !m) return false;
  const h = (s) => createHash("sha256").update(s).digest();
  return timingSafeEqual(h(m[1]), h(secret));
}

export default async function handler(req, res) {
  if (cors(req, res)) return;
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method not allowed" });
  }
  if (!schedulerOk(req) && !verify(req)) return res.status(401).json({ ok: false, error: "not allowed" });
  if (!pushReady() || !configured()) return res.status(503).json({ ok: false, error: "push not set up" });

  let body;
  try { body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {}); }
  catch { return res.status(400).json({ ok: false, error: "bad json" }); }
  if (!String(body.title || "").trim()) return res.status(400).json({ ok: false, error: "title needed" });

  try {
    return res.status(200).json({ ok: true, ...(await broadcast(body)) });
  } catch (e) {
    return res.status(502).json({ ok: false, error: e.message });
  }
}
