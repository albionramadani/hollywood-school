// /admin-auth — POST { action: 'setup' | 'login' | 'logout' | 'me', email?, password? }
// Session-based (opaque token + HttpOnly cookie). No JWT.
import { admin } from "../_shared/client.ts";
import { corsHeaders, json } from "../_shared/cors.ts";
import {
  verifyPassword, newToken,
  sessionCookie, clearCookie, sessionExpiry, getCookie,
} from "../_shared/auth.ts";

const withCookie = (body: unknown, cookie: string, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Set-Cookie": cookie },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const db = admin();
  let body: Record<string, string> = {};
  try { body = await req.json(); } catch { /* ignore */ }
  const action = body.action;

  // NOTE: admin creation is intentionally NOT exposed here. New admins are
  // provisioned only via a trusted channel (SQL). No public signup/setup.

  if (action === "login") {
    const email = (body.email || "").toLowerCase();
    const { data: user } = await db
      .from("admin_users").select("id, password_hash").eq("email", email).maybeSingle();
    // verify even if user missing (avoid timing/user enumeration)
    const ok = user ? await verifyPassword(body.password || "", user.password_hash) : await verifyPassword(body.password || "", "pbkdf2$1$AA$AA");
    if (!user || !ok) return json({ error: "Invalid credentials" }, 401);

    const token = newToken();
    const { error } = await db.from("admin_sessions").insert({ token, user_id: user.id, expires_at: sessionExpiry() });
    if (error) return json({ error: error.message }, 500);
    return withCookie({ ok: true, email }, sessionCookie(token));
  }

  if (action === "logout") {
    const token = getCookie(req);
    if (token) await db.from("admin_sessions").delete().eq("token", token);
    return withCookie({ ok: true }, clearCookie());
  }

  if (action === "me") {
    const token = getCookie(req);
    if (!token) return json({ authenticated: false });
    const { data } = await db
      .from("admin_sessions")
      .select("expires_at, admin_users(email)")
      .eq("token", token).maybeSingle();
    if (!data || new Date(data.expires_at).getTime() < Date.now()) {
      return json({ authenticated: false });
    }
    // deno-lint-ignore no-explicit-any
    const email = (data as any).admin_users?.email ?? null;
    return json({ authenticated: true, email });
  }

  return json({ error: "Unknown action" }, 400);
});
