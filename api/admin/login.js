// POST /api/admin/login {password} -> sets the admin cookie
// POST /api/admin/login {logout:true} -> clears it
import { redis, configured } from "../_lib/store.js";
import { sign, cookie, clearCookie, passwordOk } from "../_lib/auth.js";
import { cors } from "../_lib/cors.js";

export default async function handler(req, res) {
  if (cors(req, res)) return;
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method not allowed" });
  }
  const body = typeof req.body === "string" ? safeParse(req.body) : (req.body || {});

  if (body.logout) {
    res.setHeader("Set-Cookie", clearCookie());
    return res.status(200).json({ ok: true });
  }
  if (!process.env.ADMIN_PASSWORD) {
    return res.status(503).json({ ok: false, error: "ADMIN_PASSWORD not set" });
  }

  // 10 attempts per IP per 10 minutes
  if (configured()) {
    try {
      const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
      const key = `linkeen:login:${ip}`;
      const n = await redis("INCR", key);
      if (n === 1) await redis("EXPIRE", key, "600");
      if (n > 10) return res.status(429).json({ ok: false, error: "too many attempts" });
    } catch {
      return res.status(502).json({ ok: false, error: "store unreachable" });
    }
  }

  if (!passwordOk(body.password)) return res.status(401).json({ ok: false, error: "wrong password" });
  const token = sign();
  res.setHeader("Set-Cookie", cookie(token));
  return res.status(200).json({ ok: true, token });
}

function safeParse(s) {
  try { return JSON.parse(s); } catch { return {}; }
}
