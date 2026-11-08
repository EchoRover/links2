// GET /api/overrides — public: the live override ops, patched over the static
// data by overrides.js on every page. Short edge cache so it stays cheap.
import { configured, listActive, rev } from "./_lib/store.js";
import { cors } from "./_lib/cors.js";

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "method not allowed" });
  }
  try {
    if (!configured()) throw new Error("no store");
    const ops = await listActive();
    res.setHeader("Cache-Control", "public, s-maxage=5, stale-while-revalidate=30");
    return res.status(200).json({ ok: true, rev: rev(ops), ops });
  } catch {
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ ok: false, ops: [] });
  }
}
