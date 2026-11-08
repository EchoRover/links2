// Single-password admin auth: a signed, expiring cookie. No sessions stored.
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const NAME = "linkeen_admin";
const MAX_AGE = 30 * 24 * 60 * 60;

const secret = () => process.env.ADMIN_PASSWORD || "";
const mac = (exp) => createHmac("sha256", secret()).update(String(exp)).digest("base64url");

function safeEq(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}

export function sign() {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  return `${exp}.${mac(exp)}`;
}

export function verify(req) {
  if (!secret()) return false;
  const m = String(req.headers.cookie || "").match(new RegExp(`(?:^|;\\s*)${NAME}=([^;]+)`));
  if (!m) return false;
  const [exp, sig] = m[1].split(".");
  if (!exp || !sig || !(Number(exp) > Date.now() / 1000)) return false;
  return safeEq(sig, mac(exp));
}

export function passwordOk(input) {
  if (!secret()) return false;
  const h = (s) => createHash("sha256").update(String(s)).digest();
  return timingSafeEqual(h(input), h(secret()));
}

export function cookie(token) {
  return `${NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/api; Max-Age=${MAX_AGE}`;
}

export function clearCookie() {
  return `${NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/api; Max-Age=0`;
}
