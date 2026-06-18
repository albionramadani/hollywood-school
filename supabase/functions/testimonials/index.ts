// /testimonials — admin CRUD (reads come from /catalog)
//   POST   create { ...fields }
//   PATCH  update { id, ...fields }
//   DELETE remove { id }
import { admin } from "../_shared/client.ts";
import { corsHeaders, json } from "../_shared/cors.ts";
import { requireAdmin } from "../_shared/auth.ts";

const FIELDS = ["name", "initials", "role", "quote", "rating", "category", "featured", "visible", "sort"];
const pick = (o: Record<string, unknown>) =>
  Object.fromEntries(FIELDS.filter((f) => f in o).map((f) => [f, o[f]]));

const slug = (s: string) =>
  (s || "t").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 24);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const db = admin();
  if (!(await requireAdmin(req, db))) return json({ error: "Unauthorized" }, 401);

  if (req.method === "POST") {
    const body = await req.json();
    const id = body.id ?? slug(body.name) + "-" + crypto.randomUUID().slice(0, 4);
    const { data, error } = await db.from("testimonials").insert({ id, ...pick(body) }).select("*").single();
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true, testimonial: data }, 201);
  }
  if (req.method === "PATCH") {
    const body = await req.json();
    if (!body.id) return json({ error: "id required" }, 422);
    const { data, error } = await db.from("testimonials").update(pick(body)).eq("id", body.id).select("*").single();
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true, testimonial: data });
  }
  if (req.method === "DELETE") {
    const { id } = await req.json();
    if (!id) return json({ error: "id required" }, 422);
    const { error } = await db.from("testimonials").delete().eq("id", id);
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  }
  return json({ error: "Method not allowed" }, 405);
});
