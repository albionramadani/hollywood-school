// /settings — admin read/write of the key/value settings (bank details, academy info).
import { admin } from "../_shared/client.ts";
import { corsHeaders, json } from "../_shared/cors.ts";
import { requireAdmin } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const db = admin();
  if (!(await requireAdmin(req, db))) return json({ error: "Unauthorized" }, 401);

  if (req.method === "GET") {
    const { data, error } = await db.from("settings").select("key,value");
    if (error) return json({ error: error.message }, 500);
    const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
    return json({ settings: map });
  }

  if (req.method === "PATCH") {
    const body = await req.json(); // { key: value, ... }
    const rows = Object.entries(body).map(([key, value]) => ({ key, value: String(value ?? "") }));
    if (!rows.length) return json({ error: "No settings provided" }, 422);
    const { error } = await db.from("settings").upsert(rows, { onConflict: "key" });
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  }

  return json({ error: "Method not allowed" }, 405);
});
