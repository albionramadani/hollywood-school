// /courses — admin CRUD (currently open; add auth before go-live)
//   POST   — create { ...course }
//   PATCH  — update { id, ...fields }
//   DELETE — remove { id }
import { admin } from "../_shared/client.ts";
import { corsHeaders, json } from "../_shared/cors.ts";
import { requireAdmin } from "../_shared/auth.ts";

const FIELDS = [
  "category_id", "title", "level", "duration", "schedule",
  "description", "instructor", "price", "seats", "cap", "sort",
];

const pick = (obj: Record<string, unknown>) =>
  Object.fromEntries(FIELDS.filter((f) => f in obj).map((f) => [f, obj[f]]));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const db = admin();

  // every method here mutates the catalogue — admins only
  if (!(await requireAdmin(req, db))) return json({ error: "Unauthorized" }, 401);

  if (req.method === "POST") {
    const body = await req.json();
    const id = body.id ?? "new-" + crypto.randomUUID().slice(0, 8);
    const { data, error } = await db
      .from("courses")
      .insert({ id, ...pick(body) })
      .select("*")
      .single();
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true, course: data }, 201);
  }

  if (req.method === "PATCH") {
    const body = await req.json();
    if (!body.id) return json({ error: "id required" }, 422);
    const { data, error } = await db
      .from("courses")
      .update(pick(body))
      .eq("id", body.id)
      .select("*")
      .single();
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true, course: data });
  }

  if (req.method === "DELETE") {
    const { id } = await req.json();
    if (!id) return json({ error: "id required" }, 422);
    const { error } = await db.from("courses").delete().eq("id", id);
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  }

  return json({ error: "Method not allowed" }, 405);
});
