// /upload — admin-only image upload. POST { filename, contentType, contentBase64 }
// → stores in the public `uploads` bucket → returns the public URL.
import { admin } from "../_shared/client.ts";
import { corsHeaders, json } from "../_shared/cors.ts";
import { requireAdmin } from "../_shared/auth.ts";
import { decodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";

const slug = (s: string) =>
  (s || "image").toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/(^-|-$)/g, "");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const db = admin();
  if (!(await requireAdmin(req, db))) return json({ error: "Unauthorized" }, 401);

  const { filename, contentType, contentBase64 } = await req.json();
  if (!contentBase64) return json({ error: "contentBase64 required" }, 422);

  // strip a possible data: URL prefix
  const b64 = String(contentBase64).includes(",")
    ? String(contentBase64).split(",").pop()!
    : String(contentBase64);
  const bytes = decodeBase64(b64);

  const ext = (filename && filename.includes(".")) ? filename.split(".").pop() : "jpg";
  const path = `${crypto.randomUUID().slice(0, 8)}-${slug(filename || "image").slice(0, 30)}`.replace(/\.[^.]*$/, "") + "." + ext;

  const up = await db.storage.from("uploads").upload(path, bytes, {
    contentType: contentType || "image/jpeg",
    upsert: true,
  });
  if (up.error) return json({ error: up.error.message }, 500);

  const { data } = db.storage.from("uploads").getPublicUrl(path);
  return json({ ok: true, url: data.publicUrl });
});
