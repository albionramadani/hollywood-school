// /mail-test — admin-only SMTP diagnostic. POST { to } → tries to send a
// test email via the configured smtp_settings and returns the exact result.
import { admin } from "../_shared/client.ts";
import { corsHeaders, json } from "../_shared/cors.ts";
import { requireAdmin } from "../_shared/auth.ts";
import { sendMail } from "../_shared/email.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const db = admin();
  if (!(await requireAdmin(req, db))) return json({ error: "Unauthorized" }, 401);

  let to = "";
  try { to = (await req.json()).to; } catch { /* ignore */ }

  const { data: cfg } = await db
    .from("smtp_settings")
    .select("from_email")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  to = to || cfg?.from_email || "";
  if (!to) return json({ ok: false, error: "No recipient and no smtp_settings configured." });

  try {
    await sendMail({
      to,
      subject: "Hollywood School — SMTP test",
      html: "<p>If you can read this, SMTP works ✅</p>",
      text: "SMTP works",
    });
    return json({ ok: true, to });
  } catch (e) {
    return json({ ok: false, to, error: e instanceof Error ? e.message : String(e) });
  }
});
