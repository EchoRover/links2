// GET    /api/push/subscribe          -> { key } (VAPID public key)
// POST   /api/push/subscribe {sub, prefs, old?} -> save / update this browser (old = rotated endpoint)
// POST   /api/push/subscribe {here: endpoint} -> this phone is on campus today, stop bus pings
// DELETE /api/push/subscribe {endpoint}   -> forget this browser
import { configured } from "../_lib/store.js";
import { cors } from "../_lib/cors.js";
import { vapidPublic, pushReady, cleanSub, saveSub, dropSub, markHere } from "../_lib/push.js";

export default async function handler(req, res) {
  if (cors(req, res)) return;
  res.setHeader("Cache-Control", "no-store");
  if (!pushReady() || !configured()) return res.status(503).json({ ok: false, error: "push not set up" });
  if (req.method === "GET") return res.status(200).json({ ok: true, key: vapidPublic() });

  let body;
  try { body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {}); }
  catch { return res.status(400).json({ ok: false, error: "bad json" }); }

  try {
    if (req.method === "POST" && body.here) {
      await markHere(body.here);
      return res.status(200).json({ ok: true });
    }
    if (req.method === "POST") {
      await saveSub(cleanSub(body.sub), body.prefs || null, body.old ? String(body.old) : null);
      return res.status(200).json({ ok: true });
    }
    if (req.method === "DELETE") {
      await dropSub(body.endpoint);
      return res.status(200).json({ ok: true });
    }
  } catch (e) {
    return res.status(400).json({ ok: false, error: e.message });
  }
  res.setHeader("Allow", "GET, POST, DELETE");
  return res.status(405).json({ ok: false, error: "method not allowed" });
}
