// The API lives on its own Vercel project (linkeen-api) so the admin secrets
// stay off the site's project. The site calls it cross-origin, so allow only
// the site and local dev. Returns true when it answered a preflight.
const OK = /^https:\/\/linkeen\.vercel\.app$|^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

export function cors(req, res) {
  const origin = String(req.headers.origin || "");
  if (OK.test(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.setHeader("Access-Control-Max-Age", "86400");
  }
  if (req.method === "OPTIONS") { res.status(204).end(); return true; }
  return false;
}
