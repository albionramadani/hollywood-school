import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Service-role client — bypasses RLS. Only ever used inside Edge Functions
// (never exposed to the browser). SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
// are injected automatically by the Supabase runtime.
export const admin = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
