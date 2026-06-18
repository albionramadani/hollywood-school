// /contact — public contact form. POST { name, email, phone?, message }
// → emails the academy inbox (settings.contact_email || academy_email).
import { admin } from "../_shared/client.ts";
import { corsHeaders, json } from "../_shared/cors.ts";
import { sendMail } from "../_shared/email.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: Record<string, string> = {};
  try { body = await req.json(); } catch { /* ignore */ }
  const { name, email, message } = body;
  if (!name || !email || !message) return json({ error: "Missing name/email/message" }, 422);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Invalid email" }, 422);

  const db = admin();
  const { data: rows } = await db.from("settings").select("key,value");
  const s: Record<string, string> = Object.fromEntries((rows ?? []).map((r) => [r.key, r.value]));
  const to = s.contact_email || s.academy_email || "info@thehollywoodschool.com";

  const html = `
    <div style="font-family:Arial,sans-serif;color:#1a1a1a">
      <h2 style="margin:0 0 10px">New contact message</h2>
      <p><b>Name:</b> ${name}<br/>
         <b>Email:</b> ${email}<br/>
         ${body.phone ? `<b>Phone:</b> ${body.phone}<br/>` : ""}</p>
      <p style="white-space:pre-wrap">${String(message).replace(/</g, "&lt;")}</p>
    </div>`;

  try {
    await sendMail({
      to,
      subject: `Contact form — ${name}`,
      html,
      text: `From ${name} <${email}>${body.phone ? " / " + body.phone : ""}\n\n${message}`,
    });
    return json({ ok: true });
  } catch (e) {
    console.error("contact email failed:", e);
    return json({ ok: false, error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
