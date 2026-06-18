// GET /catalog — returns all public site data in one payload.
import { admin } from "../_shared/client.ts";
import { corsHeaders, json } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);

  const db = admin();
  const [categories, courses, summer, testimonials, media, settings] = await Promise.all([
    db.from("categories").select("*").order("sort"),
    db.from("courses").select("*").order("sort"),
    db.from("summer_programs").select("*").order("sort"),
    db.from("testimonials").select("*").eq("visible", true).order("sort"),
    db.from("media_items").select("*").order("sort"),
    db.from("settings").select("key,value"),
  ]);

  const err = categories.error || courses.error || summer.error || testimonials.error || media.error;
  if (err) return json({ error: err.message }, 500);

  return json({
    categories: categories.data,
    courses: courses.data,
    summerPrograms: summer.data,
    testimonials: testimonials.data,
    mediaItems: media.data,
    settings: Object.fromEntries((settings.data ?? []).map((r) => [r.key, r.value])),
  });
});
