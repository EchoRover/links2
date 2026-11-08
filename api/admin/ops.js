// GET    /api/admin/ops           -> live ops
// POST   /api/admin/ops {ops,sourceText} -> validate, store
// DELETE /api/admin/ops?id=...    -> undo one op
import { randomBytes } from "node:crypto";
import { configured, listActive, putOp, delOp } from "../_lib/store.js";
import { verify } from "../_lib/auth.js";
import { validate, expiresOf } from "../_lib/schema.js";
import { cors } from "../_lib/cors.js";

export default async function handler(req, res) {
  if (cors(req, res)) return;
  res.setHeader("Cache-Control", "no-store");
  if (!verify(req)) return res.status(401).json({ ok: false, error: "not logged in" });
  if (!configured()) return res.status(503).json({ ok: false, error: "no store configured" });

  try {
    if (req.method === "GET") {
      return res.status(200).json({ ok: true, ops: await listActive() });
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
      const list = Array.isArray(body.ops) ? body.ops : [];
      if (!list.length || list.length > 10) {
        return res.status(400).json({ ok: false, error: "send 1 to 10 ops" });
      }
      const sourceText = String(body.sourceText || "").replace(/\s+/g, " ").trim().slice(0, 500);
      const now = new Date().toISOString();
      const stored = [];
      try {
        for (const raw of list) {
          const op = validate(raw);
          stored.push({ ...op, id: randomBytes(4).toString("hex"), createdAt: now,
                        expires: expiresOf(op), sourceText });
        }
      } catch (e) {
        return res.status(400).json({ ok: false, error: e.message });
      }
      for (const op of stored) await putOp(op);
      return res.status(200).json({ ok: true, ops: stored });
    }

    if (req.method === "DELETE") {
      const id = String(req.query.id || "");
      if (!/^[0-9a-f]{8}$/.test(id)) return res.status(400).json({ ok: false, error: "bad id" });
      await delOp(id);
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST, DELETE");
    return res.status(405).json({ ok: false, error: "method not allowed" });
  } catch {
    return res.status(502).json({ ok: false, error: "store unreachable" });
  }
}
