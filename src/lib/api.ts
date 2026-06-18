// =====================================================================
// API layer.
//  • Public reads/writes (catalog, enroll) go straight to the Edge Functions.
//  • Admin calls go through the same-origin `/api` proxy with credentials so
//    the HttpOnly SESSION cookie (not a JWT) is sent first-party. Every admin
//    function is gated server-side by requireAdmin — without a valid session
//    nothing is readable or writable.
//  • With no backend configured, public calls fall back to mock data.
// =====================================================================
import { supabase, hasBackend } from "@/lib/supabase";

const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** Same-origin call to an Edge Function via the Vite `/api` proxy, sending the
 *  session cookie. Throws on non-2xx with the server's error message. */
async function adminFetch(fn: string, opts: { method?: string; body?: unknown } = {}) {
  const res = await fetch(`/api/${fn}`, {
    method: opts.method ?? "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(ANON ? { apikey: ANON, Authorization: `Bearer ${ANON}` } : {}),
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string })?.error || `Request failed (${res.status})`);
  return data;
}

// ---------- Public: enrollment ----------
export interface RegistrationPayload {
  contactName: string;
  phone: string;
  email: string;
  studentName: string;
  dob: string;
  language?: string;
  timePreference?: string;
  schedule?: string;
  photoConsent?: boolean;
  rulesConsent?: boolean;
  programId?: string;
  programTitle?: string;
  amount?: number;
  paymentMethod?: string;
}
export interface RegistrationResult {
  ok: boolean;
  confirmation: string;
  id?: string;
  invoiceUrl?: string | null;
}

const localConfirmation = () =>
  "HS-" + Math.random().toString(36).slice(2, 7).toUpperCase() + "-" + new Date().getFullYear();

export async function createRegistration(payload: RegistrationPayload): Promise<RegistrationResult> {
  if (!hasBackend || !supabase) return { ok: true, confirmation: localConfirmation() };
  const { data, error } = await supabase.functions.invoke("registrations", { method: "POST", body: payload });
  if (error) throw error;
  return data as RegistrationResult;
}

// ---------- Public: catalog ----------
export async function fetchCatalog() {
  if (!hasBackend || !supabase) return null;
  try {
    const { data, error } = await supabase.functions.invoke("catalog", { method: "GET" });
    if (error) throw error;
    return data as {
      categories: unknown[]; courses: unknown[]; summerPrograms: unknown[];
      testimonials: unknown[]; mediaItems: unknown[];
    };
  } catch {
    return null;
  }
}

// ---------- Admin: auth (session-based) ----------
export interface AdminMe { authenticated: boolean; email?: string | null }

export async function adminMe(): Promise<AdminMe> {
  if (!hasBackend) return { authenticated: false };
  try { return (await adminFetch("admin-auth", { body: { action: "me" } })) as AdminMe; }
  catch { return { authenticated: false }; }
}
export async function adminLogin(email: string, password: string) {
  return adminFetch("admin-auth", { body: { action: "login", email, password } });
}
export async function adminLogout() {
  try { await adminFetch("admin-auth", { body: { action: "logout" } }); } catch { /* ignore */ }
}

// ---------- Admin: registrations ----------
export interface RegistrationRow {
  id: string; created_at: string; confirmation: string | null;
  contact_name: string; phone: string; email: string; student_name: string; dob: string;
  language: string | null; time_preference: string | null; schedule: string | null;
  program_id: string | null; program_title: string | null;
  amount: number | null; payment_method: string | null; status: string;
}
export async function listRegistrations(): Promise<RegistrationRow[] | null> {
  if (!hasBackend) return null;
  try {
    const data = await adminFetch("registrations", { method: "GET" });
    return (data as { registrations: RegistrationRow[] }).registrations;
  } catch {
    return null;
  }
}
export async function updateRegistrationStatus(id: string, status: string) {
  await adminFetch("registrations", { method: "PATCH", body: { id, status } });
}

// ---------- Admin: course CRUD ----------
export interface CourseInput {
  id?: string; category_id?: string; title?: string; level?: string; duration?: string;
  schedule?: string; description?: string; instructor?: string;
  price?: number; seats?: number; cap?: number; sort?: number;
}
export async function createCourse(input: CourseInput) {
  await adminFetch("courses", { method: "POST", body: input });
}
export async function updateCourse(id: string, fields: CourseInput) {
  await adminFetch("courses", { method: "PATCH", body: { id, ...fields } });
}
export async function deleteCourse(id: string) {
  await adminFetch("courses", { method: "DELETE", body: { id } });
}

// ---------- Admin: testimonials CRUD ----------
export interface TestimonialInput {
  id?: string; name?: string; initials?: string; role?: string; quote?: string;
  rating?: number; category?: string; featured?: boolean; visible?: boolean; sort?: number;
}
export async function createTestimonial(input: TestimonialInput) {
  await adminFetch("testimonials", { method: "POST", body: input });
}
export async function updateTestimonial(id: string, fields: TestimonialInput) {
  await adminFetch("testimonials", { method: "PATCH", body: { id, ...fields } });
}
export async function deleteTestimonial(id: string) {
  await adminFetch("testimonials", { method: "DELETE", body: { id } });
}

// ---------- Admin: media CRUD ----------
export interface MediaInput {
  id?: string; title?: string; category?: string; video?: boolean; image?: string; sort?: number;
}
export async function createMedia(input: MediaInput) {
  await adminFetch("media", { method: "POST", body: input });
}
export async function updateMedia(id: string, fields: MediaInput) {
  await adminFetch("media", { method: "PATCH", body: { id, ...fields } });
}
export async function deleteMedia(id: string) {
  await adminFetch("media", { method: "DELETE", body: { id } });
}

// ---------- Admin: category CRUD ----------
export interface CategoryInput {
  id?: string; title?: string; age?: string; description?: string; about?: string;
  highlights?: string[]; image?: string; sort?: number;
}
export async function createCategory(input: CategoryInput) {
  await adminFetch("categories", { method: "POST", body: input });
}
export async function updateCategory(id: string, fields: CategoryInput) {
  await adminFetch("categories", { method: "PATCH", body: { id, ...fields } });
}
export async function deleteCategory(id: string) {
  await adminFetch("categories", { method: "DELETE", body: { id } });
}

// ---------- Admin: summer-program CRUD ----------
export interface SummerInput {
  id?: string; title?: string; audience?: string; duration?: string; start?: string;
  status?: string; highlight?: boolean; price?: number; sort?: number;
}
export async function createSummer(input: SummerInput) {
  await adminFetch("summer", { method: "POST", body: input });
}
export async function updateSummer(id: string, fields: SummerInput) {
  await adminFetch("summer", { method: "PATCH", body: { id, ...fields } });
}
export async function deleteSummer(id: string) {
  await adminFetch("summer", { method: "DELETE", body: { id } });
}

// ---------- Admin: settings ----------
export async function getSettings(): Promise<Record<string, string> | null> {
  if (!hasBackend) return null;
  try {
    const data = await adminFetch("settings", { method: "GET" });
    return (data as { settings: Record<string, string> }).settings;
  } catch {
    return null;
  }
}
export async function updateSettings(values: Record<string, string>) {
  await adminFetch("settings", { method: "PATCH", body: values });
}

export interface MailTestResult {
  ok: boolean;
  to?: string;
  error?: string;
  env?: { host: string | null; port: string | null; user: string | null; from: string | null; hasPass: boolean };
}
export async function sendTestEmail(to: string): Promise<MailTestResult> {
  return adminFetch("mail-test", { body: { to } }) as Promise<MailTestResult>;
}

// ---------- Admin: SMTP config (smtp_settings table) ----------
export interface SmtpConfig {
  host?: string;
  port?: number;
  secure?: boolean;
  username?: string;
  password?: string;
  from_email?: string;
  from_name?: string;
}
export async function getSmtp(): Promise<SmtpConfig | null> {
  if (!hasBackend) return null;
  try {
    const data = await adminFetch("smtp", { method: "GET" });
    return (data as { smtp: SmtpConfig | null }).smtp;
  } catch {
    return null;
  }
}
export async function saveSmtp(cfg: SmtpConfig) {
  await adminFetch("smtp", { method: "POST", body: cfg });
}

// ---------- Admin: image upload ----------
export async function uploadImage(file: File): Promise<string> {
  const contentBase64: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const data = await adminFetch("upload", {
    body: { filename: file.name, contentType: file.type, contentBase64 },
  });
  return (data as { url: string }).url;
}

// ---------- Public: contact form ----------
export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  message: string;
}
export async function sendContact(payload: ContactPayload): Promise<{ ok: boolean; error?: string }> {
  if (!hasBackend || !supabase) return { ok: false, error: "Backend not configured" };
  const { data, error } = await supabase.functions.invoke("contact", { method: "POST", body: payload });
  if (error) throw error;
  return data as { ok: boolean };
}
