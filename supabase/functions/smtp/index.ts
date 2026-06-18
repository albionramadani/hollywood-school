// /smtp — admin-only read/write of the SMTP config (smtp_settings table).
import { admin } from "../_shared/client.ts";
import { corsHeaders, json } from "../_shared/cors.ts";
import { requireAdmin } from "../_shared/auth.ts";

const FIELDS = ["host", "port", "secure", "username", "password", "from_email", "from_name"];
const pick = (o: Record<string, unknown>) =>
  Object.fromEntries(FIELDS.filter((f) => f in o).map((f) => [f, o[f]]));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const db = admin();
  if (!(await requireAdmin(req, db))) return json({ error: "Unauthorized" }, 401);

  const latest = async () =>
    (await db.from("smtp_settings").select("*").order("created_at", { ascending: false }).limit(1).maybeSingle()).data;

  if (req.method === "GET") {
    return json({ smtp: await latest() });
  }

  if (req.method === "POST") {
    const body = await req.json();
    const fields = pick(body);
    const existing = await latest();
    const { error } = existing
      ? await db.from("smtp_settings").update(fields).eq("id", existing.id)
      : await db.from("smtp_settings").insert(fields);
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  }

  return json({ error: "Method not allowed" }, 405);
});
