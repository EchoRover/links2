// POST /api/admin/parse {system, messages:[{role,content}]} -> Gemini JSON reply.
// The client supplies the system prompt because it holds the timetable data.
import { verify } from "../_lib/auth.js";
import { cors } from "../_lib/cors.js";

export default async function handler(req, res) {
  if (cors(req, res)) return;
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method not allowed" });
  }
  if (!verify(req)) return res.status(401).json({ ok: false, error: "not logged in" });
  const key = (process.env.GEMINI_API_KEY || "").trim();
  if (!key) return res.status(503).json({ ok: false, error: "GEMINI_API_KEY not set" });

  let body;
  try {
    const raw = typeof req.body === "string" ? req.body : JSON.stringify(req.body || {});
    if (raw.length > 24 * 1024) return res.status(413).json({ ok: false, error: "too large" });
    body = JSON.parse(raw);
  } catch {
    return res.status(400).json({ ok: false, error: "bad json" });
  }
  const system = String(body.system || "");
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (!system || !messages.length) return res.status(400).json({ ok: false, error: "empty request" });

  const model = (process.env.GEMINI_MODEL || "").trim() || "gemini-3.5-flash";
  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: messages.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: String(m.content || "") }],
          })),
          generationConfig: { responseMimeType: "application/json", temperature: 0.1 },
        }),
      }
    );
    if (!r.ok) return res.status(502).json({ ok: false, error: `gemini ${r.status}` });
    const data = await r.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
    if (!text) return res.status(502).json({ ok: false, error: "empty reply" });
    return res.status(200).json({ ok: true, text, brain: "gemini:" + model });
  } catch {
    return res.status(502).json({ ok: false, error: "gemini unreachable" });
  }
}
