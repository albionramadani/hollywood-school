// =====================================================================
// SMTP email via nodemailer (works on Supabase Edge Functions, incl.
// Office 365 STARTTLS on 587). Config is read from the `smtp_settings`
// table — managed from Admin → Settings.
// =====================================================================
import nodemailer from "npm:nodemailer@6.9.14";
import { admin } from "./client.ts";

export interface Attachment {
  filename: string;
  contentType: string;
  contentBase64: string;
}
export interface Mail {
  to: string;
  subject: string;
  html: string;
  text?: string;
  bcc?: string;
  attachments?: Attachment[];
}

export async function sendMail(m: Mail): Promise<void> {
  const db = admin();
  const { data: cfg, error } = await db
    .from("smtp_settings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !cfg) throw new Error("SMTP not configured (no smtp_settings row).");
  if (!cfg.host || !cfg.username || !cfg.password || !cfg.from_email) {
    throw new Error("SMTP credentials incomplete (host/username/password/from_email).");
  }

  const port = cfg.port || 587;
  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port,
    secure: !!cfg.secure, // true for 465, false for 587 (STARTTLS)
    requireTLS: port === 587 && !cfg.secure,
    auth: { user: cfg.username, pass: cfg.password },
    tls: { ciphers: "TLSv1.2", minVersion: "TLSv1.2" },
  });

  await transporter.sendMail({
    from: `"${cfg.from_name || "Hollywood School"}" <${cfg.from_email}>`,
    to: m.to,
    bcc: m.bcc,
    subject: m.subject,
    text: m.text || m.html.replace(/<[^>]+>/g, " "),
    html: m.html,
    attachments: (m.attachments ?? []).map((a) => ({
      filename: a.filename,
      content: a.contentBase64,
      encoding: "base64",
      contentType: a.contentType,
    })),
  });
}
