// /registrations
//   POST   — create a registration (from the enroll wizard)
//   GET    — list registrations (admin)
//   PATCH  — update status { id, status } (admin)
import { admin } from "../_shared/client.ts";
import { corsHeaders, json } from "../_shared/cors.ts";
import { requireAdmin } from "../_shared/auth.ts";
import { sendMail } from "../_shared/email.ts";
import { buildInvoicePdf } from "../_shared/invoice.ts";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";

type Db = ReturnType<typeof admin>;

// Build the invoice PDF + load settings.
async function prepareInvoice(db: Db, body: Record<string, unknown>, confirmation: string) {
  const { data: rows } = await db.from("settings").select("key,value");
  const s: Record<string, string> = Object.fromEntries((rows ?? []).map((r) => [r.key, r.value]));
  const cur = s.currency_symbol || "$";
  const amount = Number(body.amount ?? 0);
  const pdf = await buildInvoicePdf({
    invoiceNo: confirmation,
    date: new Date().toLocaleDateString("en-GB"),
    academyName: s.academy_name || "Hollywood School",
    academyEmail: s.academy_email || "",
    academyPhone: s.academy_phone || "",
    academyAddress: s.academy_address || "",
    billName: String(body.studentName || body.contactName || ""),
    billEmail: String(body.email || ""),
    billPhone: String(body.phone || ""),
    courseTitle: String(body.programTitle || "Program"),
    amount,
    currency: cur,
    bankHolder: s.bank_holder || "",
    bankName: s.bank_name || "",
    bankIban: s.bank_iban || "",
    bankSwift: s.bank_swift || "",
    note: s.invoice_note || "",
  });
  return { pdf, s, cur, amount };
}

// Store the PDF in Supabase Storage (bucket `invoices`) → return a signed URL.
async function storeInvoice(db: Db, confirmation: string, pdf: Uint8Array): Promise<string | null> {
  const path = `${confirmation}.pdf`;
  const up = await db.storage.from("invoices").upload(path, pdf, {
    contentType: "application/pdf",
    upsert: true,
  });
  if (up.error) {
    console.error("invoice upload failed:", up.error.message);
    return null;
  }
  const { data: signed } = await db.storage.from("invoices").createSignedUrl(path, 60 * 60 * 24 * 365);
  return signed?.signedUrl ?? null;
}

// Best-effort SMTP email with the PDF attached + the download link.
async function emailInvoice(
  body: Record<string, unknown>,
  confirmation: string,
  prepared: { pdf: Uint8Array; s: Record<string, string>; cur: string; amount: number },
  invoiceUrl: string | null,
) {
  const { pdf, s, cur, amount } = prepared;
  const html = `
    <div style="font-family:Arial,sans-serif;color:#1a1a1a">
      <h2 style="margin:0 0 4px">${s.academy_name || "Hollywood School"} — Registration received</h2>
      <p>Hi ${String(body.contactName || "")}, thank you for registering <b>${String(body.studentName || "")}</b> for <b>${String(body.programTitle || "")}</b>.</p>
      <p>Invoice <b>${confirmation}</b> — total <b>${cur}${amount.toLocaleString()}</b>.${invoiceUrl ? ` <a href="${invoiceUrl}">Download the PDF invoice</a>.` : " The PDF is attached."}</p>
      <h3>Pay by bank transfer</h3>
      <p>
        Account holder: <b>${s.bank_holder || ""}</b><br/>
        Bank: <b>${s.bank_name || ""}</b><br/>
        IBAN: <b>${s.bank_iban || ""}</b>${s.bank_swift ? `<br/>SWIFT/BIC: <b>${s.bank_swift}</b>` : ""}<br/>
        Reference: <b>${confirmation}</b>
      </p>
      <p style="color:#666">${s.invoice_note || ""}</p>
    </div>`;
  await sendMail({
    to: String(body.email),
    bcc: s.academy_email || undefined,
    subject: `Invoice ${confirmation} — ${s.academy_name || "Hollywood School"}`,
    html,
    text: `Invoice ${confirmation} — total ${cur}${amount.toLocaleString()}. Pay by bank transfer to IBAN ${s.bank_iban || ""} (ref ${confirmation}). ${invoiceUrl ?? ""}`,
    attachments: [{ filename: `invoice-${confirmation}.pdf`, contentType: "application/pdf", contentBase64: encodeBase64(pdf) }],
  });
}

const required = ["contactName", "phone", "email", "studentName", "dob"];

const makeConfirmation = () =>
  "HS-" +
  Math.random().toString(36).slice(2, 7).toUpperCase() +
  "-" +
  new Date().getFullYear();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const db = admin();

  if (req.method === "POST") {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }

    const missing = required.filter((f) => !String(body[f] ?? "").trim());
    if (missing.length) return json({ error: "Missing fields", fields: missing }, 422);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(body.email))) {
      return json({ error: "Invalid email" }, 422);
    }

    const confirmation = makeConfirmation();
    const { data, error } = await db
      .from("registrations")
      .insert({
        confirmation,
        contact_name: body.contactName,
        phone: body.phone,
        email: body.email,
        student_name: body.studentName,
        dob: body.dob,
        language: body.language ?? null,
        time_preference: body.timePreference ?? null,
        schedule: body.schedule ?? null,
        photo_consent: !!body.photoConsent,
        rules_consent: !!body.rulesConsent,
        program_id: body.programId ?? null,
        program_title: body.programTitle ?? null,
        amount: body.amount ?? null,
        payment_method: body.paymentMethod ?? null,
        status: "Pending",
      })
      .select("id, confirmation")
      .single();

    if (error) return json({ error: error.message }, 500);

    // 1) Generate the PDF and store it in Supabase Storage (fast + reliable).
    let invoiceUrl: string | null = null;
    try {
      const prepared = await prepareInvoice(db, body, data.confirmation);
      invoiceUrl = await storeInvoice(db, data.confirmation, prepared.pdf);
      if (invoiceUrl) {
        await db.from("registrations").update({ invoice_path: `${data.confirmation}.pdf` }).eq("id", data.id);
      }
      // 2) Email is BEST-EFFORT and runs in the background — never blocks the order.
      const task = emailInvoice(body, data.confirmation, prepared, invoiceUrl).catch((e) =>
        console.error("invoice email failed:", e),
      );
      // deno-lint-ignore no-explicit-any
      const er = (globalThis as any).EdgeRuntime;
      if (er?.waitUntil) er.waitUntil(task);
    } catch (e) {
      console.error("invoice generation failed:", e);
    }

    return json({ ok: true, id: data.id, confirmation: data.confirmation, invoiceUrl }, 201);
  }

  if (req.method === "GET") {
    if (!(await requireAdmin(req, db))) return json({ error: "Unauthorized" }, 401);
    const { data, error } = await db
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return json({ error: error.message }, 500);
    return json({ registrations: data });
  }

  if (req.method === "PATCH") {
    if (!(await requireAdmin(req, db))) return json({ error: "Unauthorized" }, 401);
    const { id, status } = await req.json();
    if (!id || !status) return json({ error: "id and status required" }, 422);
    const { error } = await db.from("registrations").update({ status }).eq("id", id);
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  }

  return json({ error: "Method not allowed" }, 405);
});
