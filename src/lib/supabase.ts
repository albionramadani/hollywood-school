import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** Null until the project's env vars are set — lets the app fall back to mock data. */
export const supabase = url && anonKey ? createClient(url, anonKey) : null;

/** True once Supabase is configured; used to switch from mock data to the live backend. */
export const hasBackend = !!supabase;
