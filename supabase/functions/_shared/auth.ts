// Session-based admin auth helpers (NOT JWT).
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const COOKIE = "hs_admin";
const enc = new TextEncoder();
const b64 = (buf: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(buf as ArrayBuffer)));

async function pbkdf2(password: string, salt: Uint8Array, iterations: number) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations, hash: "SHA-256" }, key, 256);
  return b64(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iterations = 120000;
  const hash = await pbkdf2(password, salt, iterations);
  return `pbkdf2$${iterations}$${b64(salt)}$${hash}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, iterStr, saltB64, hashB64] = (stored || "").split("$");
  if (scheme !== "pbkdf2") return false;
  const salt = Uint8Array.from(atob(saltB64), (c) => c.charCodeAt(0));
  const computed = await pbkdf2(password, salt, parseInt(iterStr, 10));
  // length-safe comparison
  if (computed.length !== hashB64.length) return false;
  let diff = 0;
  for (let i = 0; i < computed.length; i++) diff |= computed.charCodeAt(i) ^ hashB64.charCodeAt(i);
  return diff === 0;
}

export const newToken = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

export function getCookie(req: Request, name = COOKIE): string | null {
  const header = req.headers.get("cookie") || "";
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

const MAX_AGE = 60 * 60 * 8; // 8 hours
export const sessionCookie = (token: string) =>
  `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${MAX_AGE}`;
export const clearCookie = () =>
  `${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
export const sessionExpiry = () => new Date(Date.now() + MAX_AGE * 1000).toISOString();

/** Returns the admin user id if the request carries a valid session, else null. */
export async function requireAdmin(req: Request, db: SupabaseClient): Promise<string | null> {
  const token = getCookie(req);
  if (!token) return null;
  const { data } = await db
    .from("admin_sessions")
    .select("user_id, expires_at")
    .eq("token", token)
    .maybeSingle();
  if (!data) return null;
  if (new Date(data.expires_at).getTime() < Date.now()) {
    await db.from("admin_sessions").delete().eq("token", token);
    return null;
  }
  return data.user_id as string;
}
