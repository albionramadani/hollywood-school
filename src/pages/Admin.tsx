import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  LayoutDashboard, BookOpen, Grid3x3, Users, ClipboardList, CreditCard,
  Image as ImageIcon, MessageSquare, Settings as SettingsIcon,
  Search, Download, Plus, Pencil, Trash2, LogOut, Sun,
} from "lucide-react";

import { useCatalog } from "@/hooks/useCatalog";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import AdminLogin from "@/components/AdminLogin";
import { resolveImage } from "@/lib/images";
import {
  listRegistrations, updateRegistrationStatus,
  createCourse, updateCourse, deleteCourse,
  createTestimonial, updateTestimonial, deleteTestimonial,
  createMedia, updateMedia, deleteMedia,
  createCategory, updateCategory, deleteCategory,
  createSummer, updateSummer, deleteSummer,
  updateSettings, sendTestEmail, getSmtp, saveSmtp, type SmtpConfig, uploadImage,
} from "@/lib/api";
import type { Course } from "@/data/programs";

const IMAGE_KEYS = ["class-kids", "class-teens", "class-adults", "hero-stage"];

interface AdminCourse extends Course {
  categoryId: string;
  categoryTitle: string;
}

const money = (n: number) => "$" + Number(n || 0).toLocaleString();

const pillClass = (color: string) => {
  switch (color) {
    case "green": return "bg-emerald-400/10 text-emerald-400";
    case "gold": return "bg-gold/15 text-gold";
    case "red": return "bg-red-400/10 text-red-400";
    default: return "bg-muted text-muted-foreground";
  }
};
const statusColor = (s: string) =>
  s === "Paid" ? "green" : s === "Pending" ? "gold" : s === "Refunded" ? "red" : "grey";

const NAV: { id: string; label: string; icon: typeof LayoutDashboard; group?: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "courses", label: "Courses", icon: BookOpen, group: "Catalogue" },
  { id: "categories", label: "Categories", icon: Grid3x3 },
  { id: "summer", label: "Summer", icon: Sun },
  { id: "instructors", label: "Instructors", icon: Users },
  { id: "registrations", label: "Registrations", icon: ClipboardList, group: "Operations" },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "media", label: "Media", icon: ImageIcon, group: "Content" },
  { id: "testimonials", label: "Testimonials", icon: MessageSquare },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];
const TITLES: Record<string, [string, string]> = {
  dashboard: ["Dashboard", "Overview · Live data"],
  courses: ["Courses", "Catalogue management"],
  categories: ["Categories", "Program pathways"],
  summer: ["Summer Academy", "Seasonal programs"],
  instructors: ["Instructors", "Faculty"],
  registrations: ["Registrations", "Student enrollments"],
  payments: ["Payments", "Transactions"],
  media: ["Media", "Photo library"],
  testimonials: ["Testimonials", "Reviews & stories"],
  settings: ["Settings", "Academy configuration"],
};

type Draft = Partial<AdminCourse>;
type TDraft = { id?: string; name?: string; initials?: string; role?: string; quote?: string; rating?: number; category?: string; featured?: boolean };
type MDraft = { id?: string; title?: string; category?: string; video?: boolean; image?: string };
type CDraft = { id?: string; title?: string; age?: string; description?: string; about?: string; highlights?: string; image?: string };
type SDraft = { id?: string; title?: string; audience?: string; duration?: string; start?: string; status?: string; highlight?: boolean; price?: number };

// Defined at MODULE scope (not inside the component) so their identity is stable
// across renders — otherwise every keystroke remounts inputs and steals focus.
const Stat = ({ k, v, d, up }: { k: string; v: string; d?: string; up?: boolean }) => (
  <div className="bg-card border border-border rounded-xl p-5">
    <div className="text-sm text-muted-foreground">{k}</div>
    <div className="font-display text-3xl text-foreground my-1">{v}</div>
    {d && <div className={`text-xs font-semibold ${up ? "text-emerald-400" : "text-muted-foreground"}`}>{d}</div>}
  </div>
);
const Panel = ({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) => (
  <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
    <div className="flex items-center justify-between px-5 py-4 border-b border-border">
      <h3 className="font-display text-lg text-foreground">{title}</h3>
      {action}
    </div>
    {children}
  </div>
);
const Table = ({ head, children }: { head: string[]; children: React.ReactNode }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead><tr>{head.map((h, i) => <th key={i} className="text-left text-xs uppercase tracking-wide text-muted-foreground font-semibold px-5 py-3 border-b border-border">{h}</th>)}</tr></thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);
const Pill = ({ color, children }: { color: string; children: React.ReactNode }) => (
  <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${pillClass(color)}`}>{children}</span>
);
const IconBtn = ({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) => (
  <button onClick={onClick} className="w-8 h-8 flex items-center justify-center border border-border rounded-lg text-muted-foreground hover:border-gold hover:text-gold transition-colors">{children}</button>
);

const AdminConsole = ({ email, onLogout }: { email: string | null; onLogout: () => void }) => {
  const qc = useQueryClient();
  const { categories, coursesByCategory, testimonials, mediaItems, summerPrograms, settings } = useCatalog();

  const courses: AdminCourse[] = useMemo(() => {
    const out: AdminCourse[] = [];
    for (const cat of categories)
      for (const c of coursesByCategory[cat.id] ?? [])
        out.push({ ...c, categoryId: cat.id, categoryTitle: cat.title });
    return out;
  }, [categories, coursesByCategory]);

  const { data: regsRaw } = useQuery({ queryKey: ["registrations"], queryFn: listRegistrations });
  const regs = useMemo(
    () =>
      (regsRaw ?? []).map((r) => ({
        id: r.id,
        name: r.student_name,
        contact: r.contact_name,
        course: r.program_title ?? "—",
        email: r.email,
        method: r.payment_method ?? "—",
        confirmation: r.confirmation ?? r.id.slice(0, 8),
        amount: Number(r.amount ?? 0),
        status: r.status,
        createdAt: r.created_at,
        date: new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      })),
    [regsRaw]
  );

  const [view, setView] = useState("dashboard");
  const [regFilter, setRegFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>({});
  const [busy, setBusy] = useState(false);

  const [tOpen, setTOpen] = useState(false);
  const [tEditId, setTEditId] = useState<string | null>(null);
  const [tDraft, setTDraft] = useState<TDraft>({});
  const [mOpen, setMOpen] = useState(false);
  const [mEditId, setMEditId] = useState<string | null>(null);
  const [mDraft, setMDraft] = useState<MDraft>({});
  const [mCurrentImage, setMCurrentImage] = useState("");
  const [cOpen, setCOpen] = useState(false);
  const [cEditId, setCEditId] = useState<string | null>(null);
  const [cDraft, setCDraft] = useState<CDraft>({});
  const [cCurrentImage, setCCurrentImage] = useState("");
  const [sOpen, setSOpen] = useState(false);
  const [sEditId, setSEditId] = useState<string | null>(null);
  const [sDraft, setSDraft] = useState<SDraft>({});
  const [setForm, setSetForm] = useState<Record<string, string>>(settings);
  useEffect(() => { setSetForm(settings); }, [settings]);

  // ---- KPIs ----
  const paid = regs.filter((r) => r.status === "Paid");
  const revenue = paid.reduce((a, r) => a + r.amount, 0);
  const pendingTotal = regs.filter((r) => r.status === "Pending").reduce((a, r) => a + r.amount, 0);
  const totalSeats = courses.reduce((a, c) => a + c.cap, 0);
  const filled = courses.reduce((a, c) => a + (c.cap - c.seats), 0);
  const fillRate = totalSeats ? Math.round((filled / totalSeats) * 100) : 0;

  const instructors = useMemo(() => {
    const map = new Map<string, number>();
    courses.forEach((c) => map.set(c.instructor, (map.get(c.instructor) ?? 0) + 1));
    return [...map.entries()];
  }, [courses]);

  const chart = useMemo(() => {
    const now = new Date();
    const arr: [string, number][] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const count = (regsRaw ?? []).filter((r) => {
        const rd = new Date(r.created_at);
        return rd.getFullYear() === d.getFullYear() && rd.getMonth() === d.getMonth();
      }).length;
      arr.push([d.toLocaleDateString("en-US", { month: "short" }), count]);
    }
    return arr;
  }, [regsRaw]);
  const chartMax = Math.max(1, ...chart.map((c) => c[1]));

  const refetchCatalog = () => qc.invalidateQueries({ queryKey: ["catalog"] });
  const refetchRegs = () => qc.invalidateQueries({ queryKey: ["registrations"] });

  // ---- mutations ----
  const saveInline = async (id: string, field: "price" | "seats", value: number) => {
    try { await updateCourse(id, { [field]: value }); refetchCatalog(); }
    catch { toast.error("Could not save change."); }
  };
  const removeCourse = async (id: string) => {
    if (!confirm("Delete this course?")) return;
    try { await deleteCourse(id); refetchCatalog(); toast.success("Course deleted."); }
    catch { toast.error("Could not delete course."); }
  };
  const openAdd = () => { setEditId(null); setDraft({ categoryId: "teens", level: "Beginner" }); setModalOpen(true); };
  const openEdit = (c: AdminCourse) => { setEditId(c.id); setDraft({ ...c }); setModalOpen(true); };
  const saveModal = async () => {
    setBusy(true);
    const payload = {
      category_id: draft.categoryId ?? "teens",
      title: draft.title || "Untitled course",
      level: draft.level || "Beginner",
      duration: draft.duration || "8 weeks",
      schedule: draft.schedule || "TBD",
      instructor: draft.instructor || "TBA",
      price: Number(draft.price) || 0,
      cap: Number(draft.cap) || 12,
    };
    try {
      if (editId) await updateCourse(editId, payload);
      else await createCourse({ ...payload, seats: payload.cap });
      refetchCatalog();
      setModalOpen(false);
      toast.success(editId ? "Course updated." : "Course created.");
    } catch { toast.error("Could not save course."); }
    finally { setBusy(false); }
  };
  const changeStatus = async (id: string, status: string) => {
    try { await updateRegistrationStatus(id, status); refetchRegs(); }
    catch { toast.error("Could not update status."); }
  };

  // ---- testimonials ----
  const openTAdd = () => { setTEditId(null); setTDraft({ rating: 5, category: "parent", featured: false }); setTOpen(true); };
  const openTEdit = (t: { id: string; name: string; initials: string; role: string; quote: string; rating?: number; category?: string; featured?: boolean }) => {
    setTEditId(t.id); setTDraft({ ...t }); setTOpen(true);
  };
  const saveT = async () => {
    setBusy(true);
    const initials = tDraft.initials || (tDraft.name || "?").split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
    const payload = {
      name: tDraft.name || "Anonymous", initials, role: tDraft.role || "",
      quote: tDraft.quote || "", rating: Number(tDraft.rating) || 5,
      category: tDraft.category || "parent", featured: !!tDraft.featured, visible: true,
    };
    try {
      if (tEditId) await updateTestimonial(tEditId, payload);
      else await createTestimonial(payload);
      refetchCatalog(); setTOpen(false); toast.success(tEditId ? "Testimonial updated." : "Testimonial added.");
    } catch { toast.error("Could not save testimonial."); }
    finally { setBusy(false); }
  };
  const removeT = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    try { await deleteTestimonial(id); refetchCatalog(); toast.success("Deleted."); }
    catch { toast.error("Could not delete."); }
  };

  // ---- media ----
  const openMAdd = () => { setMEditId(null); setMDraft({ category: "photos", video: false, image: "hero-stage" }); setMCurrentImage(""); setMOpen(true); };
  const openMEdit = (m: { id: string; title: string; category: string; video?: boolean; image?: string }) => {
    setMEditId(m.id); setMDraft({ id: m.id, title: m.title, category: m.category, video: m.video }); setMCurrentImage(m.image || ""); setMOpen(true);
  };
  const saveM = async () => {
    setBusy(true);
    const payload: { title: string; category: string; video: boolean; image?: string } = {
      title: mDraft.title || "Untitled", category: mDraft.category || "photos", video: !!mDraft.video,
    };
    if (mDraft.image) payload.image = mDraft.image; // only overwrite when changed
    try {
      if (mEditId) await updateMedia(mEditId, payload);
      else await createMedia(payload);
      refetchCatalog(); setMOpen(false); toast.success(mEditId ? "Media updated." : "Media added.");
    } catch { toast.error("Could not save media."); }
    finally { setBusy(false); }
  };
  const removeM = async (id: string) => {
    if (!confirm("Delete this media item?")) return;
    try { await deleteMedia(id); refetchCatalog(); toast.success("Deleted."); }
    catch { toast.error("Could not delete."); }
  };

  // ---- categories ----
  const openCAdd = () => { setCEditId(null); setCDraft({ image: "hero-stage" }); setCCurrentImage(""); setCOpen(true); };
  const openCEdit = (cat: { id: string; title: string; age: string; description: string; about: string; highlights: string[]; image: string }) => {
    setCEditId(cat.id);
    setCDraft({ id: cat.id, title: cat.title, age: cat.age, description: cat.description, about: cat.about, highlights: (cat.highlights || []).join("\n") });
    setCCurrentImage(cat.image || "");
    setCOpen(true);
  };
  const saveC = async () => {
    setBusy(true);
    const payload: { title: string; age: string; description: string; about: string; highlights: string[]; image?: string } = {
      title: cDraft.title || "Untitled", age: cDraft.age || "",
      description: cDraft.description || "", about: cDraft.about || "",
      highlights: (cDraft.highlights || "").split("\n").map((s) => s.trim()).filter(Boolean),
    };
    if (cDraft.image) payload.image = cDraft.image; // only overwrite when changed
    try {
      if (cEditId) await updateCategory(cEditId, payload);
      else await createCategory(payload);
      refetchCatalog(); setCOpen(false); toast.success(cEditId ? "Category updated." : "Category added.");
    } catch { toast.error("Could not save category."); }
    finally { setBusy(false); }
  };
  const removeC = async (id: string) => {
    if (!confirm("Delete this category? All its courses will be deleted too.")) return;
    try { await deleteCategory(id); refetchCatalog(); toast.success("Deleted."); }
    catch { toast.error("Could not delete."); }
  };
  const [uploading, setUploading] = useState(false);
  const onCategoryImage = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try { const url = await uploadImage(file); setCDraft((d) => ({ ...d, image: url })); toast.success("Image uploaded."); }
    catch { toast.error("Upload failed."); }
    finally { setUploading(false); }
  };

  // ---- summer programs ----
  const openSAdd = () => { setSEditId(null); setSDraft({ highlight: false, status: "Open" }); setSOpen(true); };
  const openSEdit = (p: SDraft) => { setSEditId(p.id ?? null); setSDraft({ ...p }); setSOpen(true); };
  const saveS = async () => {
    setBusy(true);
    const payload = {
      title: sDraft.title || "Untitled", audience: sDraft.audience || "",
      duration: sDraft.duration || "", start: sDraft.start || "",
      status: sDraft.status || "Open", highlight: !!sDraft.highlight,
      price: Number(sDraft.price) || 0,
    };
    try {
      if (sEditId) await updateSummer(sEditId, payload);
      else await createSummer(payload);
      refetchCatalog(); setSOpen(false); toast.success(sEditId ? "Program updated." : "Program added.");
    } catch { toast.error("Could not save program."); }
    finally { setBusy(false); }
  };
  const removeS = async (id: string) => {
    if (!confirm("Delete this summer program?")) return;
    try { await deleteSummer(id); refetchCatalog(); toast.success("Deleted."); }
    catch { toast.error("Could not delete."); }
  };

  // ---- settings ----
  const SETTING_FIELDS: [string, string][] = [
    ["academy_name", "Academy name"], ["academy_email", "Contact email"],
    ["academy_phone", "Phone"], ["academy_address", "Address"],
    ["currency_symbol", "Currency symbol"], ["bank_holder", "Bank account holder"],
    ["bank_name", "Bank name"], ["bank_iban", "IBAN"], ["bank_swift", "SWIFT/BIC"],
  ];
  const saveSettings = async () => {
    setBusy(true);
    try { await updateSettings(setForm); refetchCatalog(); toast.success("Settings saved."); }
    catch { toast.error("Could not save settings."); }
    finally { setBusy(false); }
  };

  const [smtp, setSmtp] = useState<SmtpConfig>({ port: 587, secure: false });
  useEffect(() => { getSmtp().then((s) => { if (s) setSmtp(s); }); }, []);
  const saveSmtpCfg = async () => {
    setBusy(true);
    try { await saveSmtp({ ...smtp, port: Number(smtp.port) || 587 }); toast.success("SMTP saved."); }
    catch { toast.error("Could not save SMTP."); }
    finally { setBusy(false); }
  };

  const [testTo, setTestTo] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const runMailTest = async () => {
    setTesting(true); setTestResult(null);
    try {
      const r = await sendTestEmail(testTo || setForm.academy_email || "");
      if (r.ok) { setTestResult(`✅ Sent to ${r.to}`); toast.success("Test email sent."); }
      else { setTestResult(`❌ ${r.error || "Failed"}`); toast.error("Test failed — see details."); }
    } catch (e) {
      setTestResult(`❌ ${e instanceof Error ? e.message : "Failed"}`);
    } finally { setTesting(false); }
  };

  const exportCSV = () => {
    const rows = [
      ["Confirmation", "Student", "Contact", "Course", "Email", "Date", "Amount", "Status"],
      ...regs.map((r) => [r.confirmation, r.name, r.contact, r.course, r.email, r.date, String(r.amount), r.status]),
    ];
    const csv = rows.map((r) => r.map((x) => `"${x}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "hollywood-registrations.csv";
    a.click();
  };

  const inputCls = "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-gold";
  const cellInput = "bg-background border border-transparent hover:border-border focus:border-gold rounded-md px-2 py-1 outline-none";
  const lbl = "block text-xs uppercase tracking-wide text-muted-foreground mb-2";

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* sidebar */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 bg-card border-r border-border sticky top-0 h-screen p-4">
        <Link to="/" className="px-2 pb-4 mb-3 border-b border-border block">
          <div className="font-display text-xl font-bold">HOLLYWOOD <span className="text-gold">SCHOOL</span></div>
          <div className="text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground mt-1">Admin Console</div>
        </Link>
        <nav className="flex flex-col gap-1 flex-1">
          {NAV.map((n) => (
            <div key={n.id}>
              {n.group && <div className="text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground/70 px-3 pt-3 pb-1">{n.group}</div>}
              <button onClick={() => setView(n.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === n.id ? "bg-gold/15 text-gold" : "text-muted-foreground hover:bg-background hover:text-foreground"}`}>
                <n.icon size={18} strokeWidth={1.8} className="opacity-80" />
                {n.label}
                {n.id === "courses" && <span className="ml-auto bg-gold text-primary-foreground text-[0.62rem] font-bold px-2 py-0.5 rounded-full">{courses.length}</span>}
                {n.id === "registrations" && regs.length > 0 && <span className="ml-auto bg-gold text-primary-foreground text-[0.62rem] font-bold px-2 py-0.5 rounded-full">{regs.length}</span>}
              </button>
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 px-5 md:px-8 py-4 border-b border-border bg-background/85 backdrop-blur">
          <div>
            <h1 className="font-display text-xl text-foreground">{TITLES[view][0]}</h1>
            <div className="text-xs text-muted-foreground mt-0.5">{TITLES[view][1]}</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2">
              <Search size={16} className="text-muted-foreground" />
              <input placeholder="Search…" className="bg-transparent outline-none text-sm w-40" />
            </div>
            <button onClick={exportCSV} className="flex items-center gap-2 text-sm border border-border rounded-lg px-3 py-2 text-muted-foreground hover:border-gold hover:text-gold transition-colors"><Download size={15} /> Export</button>
            <button onClick={openAdd} className="flex items-center gap-1.5 text-sm bg-gold text-primary-foreground font-semibold rounded-lg px-3 py-2 hover:bg-gold-light transition-colors"><Plus size={16} /> New Course</button>
            <div className="hidden md:flex items-center gap-2 pl-2 ml-1 border-l border-border">
              {email && <span className="text-xs text-muted-foreground max-w-[140px] truncate">{email}</span>}
              <button onClick={onLogout} title="Sign out" className="w-9 h-9 flex items-center justify-center border border-border rounded-lg text-muted-foreground hover:border-gold hover:text-gold transition-colors"><LogOut size={16} /></button>
            </div>
          </div>
        </header>

        <div className="md:hidden p-4 border-b border-border">
          <select value={view} onChange={(e) => setView(e.target.value)} className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm">
            {NAV.map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
          </select>
        </div>

        <main className="p-5 md:p-8">
          {view === "dashboard" && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Stat k="Term Revenue" v={money(revenue)} d={`${paid.length} paid`} up />
                <Stat k="Registrations" v={String(regs.length)} d={`${regs.filter((r) => r.status === "Pending").length} pending`} />
                <Stat k="Live Courses" v={String(courses.length)} />
                <Stat k="Avg. Fill Rate" v={fillRate + "%"} d="Across catalogue" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                  <Panel title="Registrations by month">
                    <div className="flex items-end gap-3 h-52 p-5">
                      {chart.map(([m, v]) => (
                        <div key={m} className="flex-1 flex flex-col justify-end items-center gap-2 h-full">
                          <div className="text-xs text-muted-foreground">{v}</div>
                          <div className="w-full max-w-[40px] rounded-t-md bg-gradient-to-t from-gold/40 to-gold transition-all" style={{ height: `${(v / chartMax) * 100}%` }} />
                          <div className="text-xs text-muted-foreground">{m}</div>
                        </div>
                      ))}
                    </div>
                  </Panel>
                </div>
                <Panel title="Low-seat alerts" action={<button onClick={() => setView("courses")} className="text-sm text-gold">Manage →</button>}>
                  <div className="py-2">
                    {[...courses].sort((a, b) => a.seats - b.seats).slice(0, 5).map((c) => {
                      const pct = c.cap ? Math.round(((c.cap - c.seats) / c.cap) * 100) : 0;
                      return (
                        <div key={c.id} className="flex items-center gap-3 px-5 py-3 border-b border-border last:border-0">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold truncate">{c.title}</div>
                            <div className="text-xs text-muted-foreground">{c.seats} of {c.cap} seats left</div>
                          </div>
                          <div className="ml-auto w-20 h-1.5 rounded-full bg-background overflow-hidden"><div className="h-full bg-gradient-to-r from-gold/50 to-gold" style={{ width: `${pct}%` }} /></div>
                          <span className="text-sm text-gold font-semibold w-9 text-right">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </Panel>
              </div>
              <Panel title="Recent registrations" action={<button onClick={() => setView("registrations")} className="text-sm text-gold">View all →</button>}>
                {regs.length === 0 ? <div className="px-5 py-8 text-sm text-muted-foreground">No registrations yet.</div> : (
                  <Table head={["Student", "Course", "Date", "Amount", "Status"]}>
                    {regs.slice(0, 6).map((r) => (
                      <tr key={r.id} className="border-b border-border last:border-0 hover:bg-card/60">
                        <td className="px-5 py-3 font-semibold">{r.name}</td>
                        <td className="px-5 py-3">{r.course}</td>
                        <td className="px-5 py-3 text-muted-foreground">{r.date}</td>
                        <td className="px-5 py-3">{money(r.amount)}</td>
                        <td className="px-5 py-3"><Pill color={statusColor(r.status)}>{r.status}</Pill></td>
                      </tr>
                    ))}
                  </Table>
                )}
              </Panel>
            </>
          )}

          {view === "courses" && (
            <Panel title="All courses" action={<button onClick={openAdd} className="text-sm bg-gold text-primary-foreground font-semibold rounded-lg px-3 py-1.5">+ Add Course</button>}>
              <Table head={["Course", "Category", "Schedule", "Price ($)", "Seats", ""]}>
                {courses.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-card/60">
                    <td className="px-5 py-3"><div className="font-semibold">{c.title}</div><div className="text-xs text-muted-foreground">{c.level}</div></td>
                    <td className="px-5 py-3"><Pill color="grey">{c.categoryTitle}</Pill></td>
                    <td className="px-5 py-3 text-muted-foreground">{c.schedule}</td>
                    <td className="px-5 py-3"><input type="number" defaultValue={c.price} onBlur={(e) => { const v = +e.target.value; if (v !== c.price) saveInline(c.id, "price", v); }} className={`w-24 ${cellInput}`} /></td>
                    <td className="px-5 py-3"><input type="number" defaultValue={c.seats} onBlur={(e) => { const v = +e.target.value; if (v !== c.seats) saveInline(c.id, "seats", v); }} className={`w-16 ${cellInput}`} /> <span className="text-muted-foreground">/ {c.cap}</span></td>
                    <td className="px-5 py-3"><div className="flex gap-2"><IconBtn onClick={() => openEdit(c)}><Pencil size={15} /></IconBtn><IconBtn onClick={() => removeCourse(c.id)}><Trash2 size={15} /></IconBtn></div></td>
                  </tr>
                ))}
              </Table>
            </Panel>
          )}

          {view === "categories" && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {categories.map((cat) => (
                  <div key={cat.id} className="bg-card border border-border rounded-xl p-5">
                    <div className="text-sm text-muted-foreground">{cat.title}</div>
                    <div className="font-display text-3xl my-1">{coursesByCategory[cat.id]?.length ?? 0}</div>
                    <div className="text-xs text-muted-foreground">{cat.age}</div>
                  </div>
                ))}
              </div>
              <Panel title="Categories" action={<button onClick={openCAdd} className="text-sm bg-gold text-primary-foreground font-semibold rounded-lg px-3 py-1.5">+ Add Category</button>}>
                <Table head={["Category", "Age range", "Courses", "Open seats", ""]}>
                  {categories.map((cat) => {
                    const list = courses.filter((c) => c.categoryId === cat.id);
                    return (
                      <tr key={cat.id} className="border-b border-border last:border-0 hover:bg-card/60">
                        <td className="px-5 py-3 font-semibold">{cat.title}</td>
                        <td className="px-5 py-3 text-muted-foreground">{cat.age}</td>
                        <td className="px-5 py-3">{list.length}</td>
                        <td className="px-5 py-3">{list.reduce((a, c) => a + c.seats, 0)}</td>
                        <td className="px-5 py-3"><div className="flex gap-2"><IconBtn onClick={() => openCEdit(cat)}><Pencil size={15} /></IconBtn><IconBtn onClick={() => removeC(cat.id)}><Trash2 size={15} /></IconBtn></div></td>
                      </tr>
                    );
                  })}
                </Table>
              </Panel>
            </>
          )}

          {view === "summer" && (
            <Panel title="Summer programs" action={<button onClick={openSAdd} className="text-sm bg-gold text-primary-foreground font-semibold rounded-lg px-3 py-1.5">+ Add Program</button>}>
              <Table head={["Program", "Audience", "Duration", "Start", "Status", "Price", ""]}>
                {summerPrograms.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-card/60">
                    <td className="px-5 py-3 font-semibold">{p.title}{p.highlight && <span className="ml-2 text-[0.62rem] uppercase tracking-wide text-gold">Featured</span>}</td>
                    <td className="px-5 py-3 text-muted-foreground">{p.audience}</td>
                    <td className="px-5 py-3 text-muted-foreground">{p.duration}</td>
                    <td className="px-5 py-3 text-muted-foreground">{p.start}</td>
                    <td className="px-5 py-3"><Pill color="grey">{p.status}</Pill></td>
                    <td className="px-5 py-3">{p.price != null ? money(p.price) : "—"}</td>
                    <td className="px-5 py-3"><div className="flex gap-2"><IconBtn onClick={() => openSEdit({ id: p.id, title: p.title, audience: p.audience, duration: p.duration, start: p.start, status: p.status, highlight: p.highlight, price: p.price })}><Pencil size={15} /></IconBtn><IconBtn onClick={() => removeS(p.id)}><Trash2 size={15} /></IconBtn></div></td>
                  </tr>
                ))}
              </Table>
            </Panel>
          )}

          {view === "instructors" && (
            <Panel title="Faculty">
              <Table head={["Name", "Courses"]}>
                {instructors.map(([name, n]) => (
                  <tr key={name} className="border-b border-border last:border-0 hover:bg-card/60">
                    <td className="px-5 py-3 font-semibold">{name}</td>
                    <td className="px-5 py-3">{n}</td>
                  </tr>
                ))}
              </Table>
            </Panel>
          )}

          {view === "registrations" && (
            <Panel title="Registrations">
              <div className="flex gap-5 px-5 border-b border-border">
                {["All", "Paid", "Pending", "Waitlist"].map((s) => (
                  <button key={s} onClick={() => setRegFilter(s)} className={`py-3 text-sm border-b-2 -mb-px transition-colors ${regFilter === s ? "text-gold border-gold" : "text-muted-foreground border-transparent"}`}>{s}</button>
                ))}
              </div>
              {regs.length === 0 ? <div className="px-5 py-10 text-sm text-muted-foreground">No registrations yet. Completed enrollments will appear here.</div> : (
                <Table head={["Student", "Course", "Contact", "Date", "Amount", "Status"]}>
                  {regs.filter((r) => regFilter === "All" || r.status === regFilter).map((r) => (
                    <tr key={r.id} className="border-b border-border last:border-0 hover:bg-card/60">
                      <td className="px-5 py-3"><div className="font-semibold">{r.name}</div><div className="text-xs text-muted-foreground">{r.email}</div></td>
                      <td className="px-5 py-3">{r.course}</td>
                      <td className="px-5 py-3 text-muted-foreground">{r.contact}</td>
                      <td className="px-5 py-3 text-muted-foreground">{r.date}</td>
                      <td className="px-5 py-3">{money(r.amount)}</td>
                      <td className="px-5 py-3">
                        <select value={r.status} onChange={(e) => changeStatus(r.id, e.target.value)} className={`text-xs rounded-full px-2 py-1 ${pillClass(statusColor(r.status))} border-0 outline-none cursor-pointer`}>
                          {["Paid", "Pending", "Waitlist", "Refunded"].map((s) => <option key={s} value={s} className="bg-card text-foreground">{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </Table>
              )}
            </Panel>
          )}

          {view === "payments" && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Stat k="Collected" v={money(revenue)} d={`${paid.length} payments`} up />
                <Stat k="Pending" v={money(pendingTotal)} d={`${regs.filter((r) => r.status === "Pending").length} invoices`} />
                <Stat k="Refunded" v={money(regs.filter((r) => r.status === "Refunded").reduce((a, r) => a + r.amount, 0))} />
                <Stat k="Avg. order" v={money(paid.length ? Math.round(revenue / paid.length) : 0)} />
              </div>
              <Panel title="Transactions">
                {paid.length === 0 ? <div className="px-5 py-8 text-sm text-muted-foreground">No payments yet.</div> : (
                  <Table head={["Confirmation", "Student", "Method", "Date", "Amount", "Status"]}>
                    {paid.map((r) => (
                      <tr key={r.id} className="border-b border-border last:border-0 hover:bg-card/60">
                        <td className="px-5 py-3 text-muted-foreground">{r.confirmation}</td>
                        <td className="px-5 py-3 font-semibold">{r.name}</td>
                        <td className="px-5 py-3 text-muted-foreground">{r.method}</td>
                        <td className="px-5 py-3 text-muted-foreground">{r.date}</td>
                        <td className="px-5 py-3">{money(r.amount)}</td>
                        <td className="px-5 py-3"><Pill color="green">Succeeded</Pill></td>
                      </tr>
                    ))}
                  </Table>
                )}
              </Panel>
            </>
          )}

          {view === "media" && (
            <Panel title="Media library" action={<button onClick={openMAdd} className="text-sm bg-gold text-primary-foreground font-semibold rounded-lg px-3 py-1.5">+ Add Media</button>}>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-5">
                {mediaItems.map((m) => (
                  <div key={m.id} className="relative rounded-lg overflow-hidden border border-border aspect-square group">
                    <img src={m.image} alt={m.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <IconBtn onClick={() => openMEdit({ id: m.id, title: m.title, category: m.category, video: m.video, image: m.image })}><Pencil size={14} /></IconBtn>
                      <IconBtn onClick={() => removeM(m.id)}><Trash2 size={14} /></IconBtn>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-background/90 to-transparent text-xs">{m.title}</div>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {view === "testimonials" && (
            <Panel title="Testimonials" action={<button onClick={openTAdd} className="text-sm bg-gold text-primary-foreground font-semibold rounded-lg px-3 py-1.5">+ Add Testimonial</button>}>
              <Table head={["Author", "Role", "Rating", "Excerpt", ""]}>
                {testimonials.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0 hover:bg-card/60">
                    <td className="px-5 py-3 font-semibold">{t.name}</td>
                    <td className="px-5 py-3"><Pill color="grey">{t.role}</Pill></td>
                    <td className="px-5 py-3 text-gold whitespace-nowrap">{"★".repeat(t.rating ?? 5)}</td>
                    <td className="px-5 py-3 text-muted-foreground max-w-xs truncate">{t.quote}</td>
                    <td className="px-5 py-3"><div className="flex gap-2"><IconBtn onClick={() => openTEdit({ id: t.id, name: t.name, initials: t.initials, role: t.role, quote: t.quote, rating: t.rating, category: t.category, featured: t.featured })}><Pencil size={15} /></IconBtn><IconBtn onClick={() => removeT(t.id)}><Trash2 size={15} /></IconBtn></div></td>
                  </tr>
                ))}
              </Table>
            </Panel>
          )}

          {view === "settings" && (
            <>
              <Panel title="Academy & bank details" action={<button onClick={saveSettings} disabled={busy} className="text-sm bg-gold text-primary-foreground font-semibold rounded-lg px-3 py-1.5 disabled:opacity-60">{busy ? "Saving…" : "Save"}</button>}>
                <div className="p-6 max-w-2xl">
                  <p className="text-sm text-muted-foreground mb-5">These appear on the PDF invoice emailed to students after each order.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {SETTING_FIELDS.map(([key, label]) => (
                      <div key={key}>
                        <label className={lbl}>{label}</label>
                        <input value={setForm[key] ?? ""} onChange={(e) => setSetForm({ ...setForm, [key]: e.target.value })} className={inputCls} />
                      </div>
                    ))}
                    <div className="md:col-span-2">
                      <label className={lbl}>Invoice note</label>
                      <textarea rows={3} value={setForm.invoice_note ?? ""} onChange={(e) => setSetForm({ ...setForm, invoice_note: e.target.value })} className={inputCls} />
                    </div>
                  </div>
                </div>
              </Panel>

              <Panel title="Homepage content" action={<button onClick={saveSettings} disabled={busy} className="text-sm bg-gold text-primary-foreground font-semibold rounded-lg px-3 py-1.5 disabled:opacity-60">{busy ? "Saving…" : "Save"}</button>}>
                <div className="p-6 max-w-2xl space-y-5">
                  <p className="text-sm text-muted-foreground">Edit the static homepage text. Leave a field empty to keep the built-in default.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div><label className={lbl}>Hero line 1</label><input value={setForm.hero_line1 ?? ""} onChange={(e) => setSetForm({ ...setForm, hero_line1: e.target.value })} className={inputCls} placeholder="Where Your Imagination" /></div>
                    <div><label className={lbl}>Hero line 2</label><input value={setForm.hero_line2 ?? ""} onChange={(e) => setSetForm({ ...setForm, hero_line2: e.target.value })} className={inputCls} placeholder="Becomes a Reality!" /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div><label className={lbl}>Classes — eyebrow</label><input value={setForm.classes_eyebrow ?? ""} onChange={(e) => setSetForm({ ...setForm, classes_eyebrow: e.target.value })} className={inputCls} placeholder="Find Your Stage" /></div>
                    <div><label className={lbl}>Classes — heading</label><textarea rows={2} value={setForm.classes_heading ?? ""} onChange={(e) => setSetForm({ ...setForm, classes_heading: e.target.value })} className={inputCls} placeholder={"Programs for every age\nand every ambition."} /></div>
                  </div>
                  <div><label className={lbl}>About Us</label><textarea rows={4} value={setForm.about_us ?? ""} onChange={(e) => setSetForm({ ...setForm, about_us: e.target.value })} className={inputCls} placeholder="(default text)" /></div>
                  <div><label className={lbl}>Mission</label><textarea rows={3} value={setForm.mission ?? ""} onChange={(e) => setSetForm({ ...setForm, mission: e.target.value })} className={inputCls} placeholder="(default text)" /></div>
                  <div><label className={lbl}>Vision</label><textarea rows={2} value={setForm.vision ?? ""} onChange={(e) => setSetForm({ ...setForm, vision: e.target.value })} className={inputCls} placeholder="(default text)" /></div>
                  <div><label className={lbl}>Values (one per line)</label><textarea rows={5} value={setForm.values ?? ""} onChange={(e) => setSetForm({ ...setForm, values: e.target.value })} className={inputCls} placeholder="(default values)" /></div>
                </div>
              </Panel>

              <Panel title="Contact & map" action={<button onClick={saveSettings} disabled={busy} className="text-sm bg-gold text-primary-foreground font-semibold rounded-lg px-3 py-1.5 disabled:opacity-60">{busy ? "Saving…" : "Save"}</button>}>
                <div className="p-6 max-w-2xl grid grid-cols-1 gap-5">
                  <div><label className={lbl}>Contact form sends to</label><input value={setForm.contact_email ?? ""} onChange={(e) => setSetForm({ ...setForm, contact_email: e.target.value })} className={inputCls} placeholder={setForm.academy_email || "info@thehollywoodschool.com"} /></div>
                  <div><label className={lbl}>Google Maps embed URL</label><input value={setForm.map_embed ?? ""} onChange={(e) => setSetForm({ ...setForm, map_embed: e.target.value })} className={inputCls} placeholder="https://www.google.com/maps/embed?pb=..." /><p className="text-xs text-muted-foreground mt-2">Paste the whole <code>&lt;iframe&gt;</code> or just the <code>src</code> URL.</p></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div><label className={lbl}>Facebook URL</label><input value={setForm.facebook_url ?? ""} onChange={(e) => setSetForm({ ...setForm, facebook_url: e.target.value })} className={inputCls} placeholder="https://facebook.com/..." /></div>
                    <div><label className={lbl}>Instagram URL</label><input value={setForm.instagram_url ?? ""} onChange={(e) => setSetForm({ ...setForm, instagram_url: e.target.value })} className={inputCls} placeholder="https://instagram.com/..." /></div>
                  </div>
                </div>
              </Panel>

              <Panel title="Enrollment consents" action={<button onClick={saveSettings} disabled={busy} className="text-sm bg-gold text-primary-foreground font-semibold rounded-lg px-3 py-1.5 disabled:opacity-60">{busy ? "Saving…" : "Save"}</button>}>
                <div className="p-6 max-w-2xl space-y-5">
                  <p className="text-sm text-muted-foreground">Shown when a student clicks "shiko" next to the enrollment checkboxes. Leave empty to use the default.</p>
                  <div><label className={lbl}>Photo/video consent text</label><textarea rows={4} value={setForm.photo_consent_text ?? ""} onChange={(e) => setSetForm({ ...setForm, photo_consent_text: e.target.value })} className={inputCls} placeholder="(default text)" /></div>
                  <div><label className={lbl}>Rules / terms text</label><textarea rows={6} value={setForm.rules_text ?? ""} onChange={(e) => setSetForm({ ...setForm, rules_text: e.target.value })} className={inputCls} placeholder="(default text)" /></div>
                </div>
              </Panel>

              <Panel title="SMTP (email)" action={<button onClick={saveSmtpCfg} disabled={busy} className="text-sm bg-gold text-primary-foreground font-semibold rounded-lg px-3 py-1.5 disabled:opacity-60">{busy ? "Saving…" : "Save"}</button>}>
                <div className="p-6 max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div><label className={lbl}>Host</label><input value={smtp.host ?? ""} onChange={(e) => setSmtp({ ...smtp, host: e.target.value })} className={inputCls} placeholder="smtp.office365.com" /></div>
                  <div><label className={lbl}>Port</label><input type="number" value={smtp.port ?? 587} onChange={(e) => setSmtp({ ...smtp, port: +e.target.value })} className={inputCls} placeholder="587" /></div>
                  <div><label className={lbl}>Username</label><input value={smtp.username ?? ""} onChange={(e) => setSmtp({ ...smtp, username: e.target.value })} className={inputCls} placeholder="noreply@thehollywoodschool.com" /></div>
                  <div><label className={lbl}>Password</label><input type="password" value={smtp.password ?? ""} onChange={(e) => setSmtp({ ...smtp, password: e.target.value })} className={inputCls} placeholder="••••••••" /></div>
                  <div><label className={lbl}>From email</label><input value={smtp.from_email ?? ""} onChange={(e) => setSmtp({ ...smtp, from_email: e.target.value })} className={inputCls} placeholder="noreply@thehollywoodschool.com" /></div>
                  <div><label className={lbl}>From name</label><input value={smtp.from_name ?? ""} onChange={(e) => setSmtp({ ...smtp, from_name: e.target.value })} className={inputCls} placeholder="Hollywood School" /></div>
                  <label className="md:col-span-2 flex items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={!!smtp.secure} onChange={(e) => setSmtp({ ...smtp, secure: e.target.checked })} className="accent-[hsl(var(--gold))] w-4 h-4" /> Secure (SSL) — ✅ për portin 465; lëre bosh për 587 (STARTTLS)</label>
                </div>
              </Panel>

              <Panel title="Email test">
                <div className="p-6 max-w-2xl">
                  <p className="text-sm text-muted-foreground mb-4">Send a test email to confirm SMTP works. If it fails, the exact error shows below.</p>
                  <div className="flex flex-wrap gap-3 items-center">
                    <input value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder={setForm.academy_email || "you@email.com"} className={`${inputCls} max-w-xs`} />
                    <button onClick={runMailTest} disabled={testing} className="text-sm bg-gold text-primary-foreground font-semibold rounded-lg px-4 py-2 disabled:opacity-60">{testing ? "Sending…" : "Send test email"}</button>
                  </div>
                  {testResult && (
                    <pre className="mt-4 text-xs whitespace-pre-wrap rounded-lg border border-border bg-background p-3 text-muted-foreground">{testResult}</pre>
                  )}
                </div>
              </Panel>
            </>
          )}
        </main>
      </div>

      {/* modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-xl max-h-[88vh] overflow-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-display text-xl">{editId ? "Edit course" : "Add course"}</h3>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground text-xl">✕</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
              <div className="md:col-span-2"><label className="block text-xs uppercase tracking-wide text-muted-foreground mb-2">Course title</label><input value={draft.title ?? ""} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className={inputCls} placeholder="On-Camera Scene Study" /></div>
              <div><label className="block text-xs uppercase tracking-wide text-muted-foreground mb-2">Category</label><select value={draft.categoryId ?? "teens"} onChange={(e) => setDraft({ ...draft, categoryId: e.target.value })} className={inputCls}>{categories.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select></div>
              <div><label className="block text-xs uppercase tracking-wide text-muted-foreground mb-2">Skill level</label><select value={draft.level ?? "Beginner"} onChange={(e) => setDraft({ ...draft, level: e.target.value })} className={inputCls}>{["Beginner", "Intermediate", "Advanced", "Professional", "All levels"].map((l) => <option key={l}>{l}</option>)}</select></div>
              <div><label className="block text-xs uppercase tracking-wide text-muted-foreground mb-2">Duration</label><input value={draft.duration ?? ""} onChange={(e) => setDraft({ ...draft, duration: e.target.value })} className={inputCls} placeholder="12 weeks" /></div>
              <div><label className="block text-xs uppercase tracking-wide text-muted-foreground mb-2">Schedule</label><input value={draft.schedule ?? ""} onChange={(e) => setDraft({ ...draft, schedule: e.target.value })} className={inputCls} placeholder="Tue · 5–7pm" /></div>
              <div><label className="block text-xs uppercase tracking-wide text-muted-foreground mb-2">Instructor</label><input value={draft.instructor ?? ""} onChange={(e) => setDraft({ ...draft, instructor: e.target.value })} className={inputCls} placeholder="Dahlia Voss" /></div>
              <div><label className="block text-xs uppercase tracking-wide text-muted-foreground mb-2">Price ($)</label><input type="number" value={draft.price ?? ""} onChange={(e) => setDraft({ ...draft, price: +e.target.value })} className={inputCls} placeholder="1450" /></div>
              <div><label className="block text-xs uppercase tracking-wide text-muted-foreground mb-2">Capacity</label><input type="number" value={draft.cap ?? ""} onChange={(e) => setDraft({ ...draft, cap: +e.target.value })} className={inputCls} placeholder="14" /></div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => setModalOpen(false)} className="text-sm border border-border rounded-lg px-4 py-2 text-muted-foreground hover:border-gold hover:text-gold">Cancel</button>
              <button onClick={saveModal} disabled={busy} className="text-sm bg-gold text-primary-foreground font-semibold rounded-lg px-4 py-2 hover:bg-gold-light disabled:opacity-60">{busy ? "Saving…" : "Save course"}</button>
            </div>
          </div>
        </div>
      )}

      {/* testimonial modal */}
      {tOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setTOpen(false)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-xl max-h-[88vh] overflow-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-display text-xl">{tEditId ? "Edit testimonial" : "Add testimonial"}</h3>
              <button onClick={() => setTOpen(false)} className="text-muted-foreground hover:text-foreground text-xl">✕</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
              <div><label className={lbl}>Name</label><input value={tDraft.name ?? ""} onChange={(e) => setTDraft({ ...tDraft, name: e.target.value })} className={inputCls} placeholder="Maya R." /></div>
              <div><label className={lbl}>Role</label><input value={tDraft.role ?? ""} onChange={(e) => setTDraft({ ...tDraft, role: e.target.value })} className={inputCls} placeholder="Parent · Teens" /></div>
              <div><label className={lbl}>Category</label><select value={tDraft.category ?? "parent"} onChange={(e) => setTDraft({ ...tDraft, category: e.target.value })} className={inputCls}>{["parent", "student", "success"].map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
              <div><label className={lbl}>Rating</label><select value={tDraft.rating ?? 5} onChange={(e) => setTDraft({ ...tDraft, rating: +e.target.value })} className={inputCls}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}</option>)}</select></div>
              <div className="md:col-span-2"><label className={lbl}>Quote</label><textarea rows={3} value={tDraft.quote ?? ""} onChange={(e) => setTDraft({ ...tDraft, quote: e.target.value })} className={inputCls} /></div>
              <label className="md:col-span-2 flex items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={!!tDraft.featured} onChange={(e) => setTDraft({ ...tDraft, featured: e.target.checked })} className="accent-[hsl(var(--gold))] w-4 h-4" /> Featured (shown in the carousel)</label>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => setTOpen(false)} className="text-sm border border-border rounded-lg px-4 py-2 text-muted-foreground hover:border-gold hover:text-gold">Cancel</button>
              <button onClick={saveT} disabled={busy} className="text-sm bg-gold text-primary-foreground font-semibold rounded-lg px-4 py-2 hover:bg-gold-light disabled:opacity-60">{busy ? "Saving…" : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      {/* media modal */}
      {mOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setMOpen(false)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-display text-xl">{mEditId ? "Edit media" : "Add media"}</h3>
              <button onClick={() => setMOpen(false)} className="text-muted-foreground hover:text-foreground text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className={lbl}>Title</label><input value={mDraft.title ?? ""} onChange={(e) => setMDraft({ ...mDraft, title: e.target.value })} className={inputCls} placeholder="Spring Showcase" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={lbl}>Category</label><select value={mDraft.category ?? "photos"} onChange={(e) => setMDraft({ ...mDraft, category: e.target.value })} className={inputCls}>{["photos", "videos", "performances", "bts"].map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label className={lbl}>Image</label><select value={mDraft.image ?? ""} onChange={(e) => e.target.value && setMDraft({ ...mDraft, image: e.target.value })} className={inputCls}><option value="">{mEditId ? "— keep current —" : "— choose —"}</option>{IMAGE_KEYS.map((k) => <option key={k} value={k}>{k}</option>)}</select></div>
              </div>
              <label className="flex items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={!!mDraft.video} onChange={(e) => setMDraft({ ...mDraft, video: e.target.checked })} className="accent-[hsl(var(--gold))] w-4 h-4" /> Video</label>
              <div className="rounded-lg overflow-hidden border border-border aspect-video"><img src={mDraft.image ? resolveImage(mDraft.image) : (mCurrentImage || resolveImage(undefined))} alt="" className="w-full h-full object-cover" /></div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => setMOpen(false)} className="text-sm border border-border rounded-lg px-4 py-2 text-muted-foreground hover:border-gold hover:text-gold">Cancel</button>
              <button onClick={saveM} disabled={busy} className="text-sm bg-gold text-primary-foreground font-semibold rounded-lg px-4 py-2 hover:bg-gold-light disabled:opacity-60">{busy ? "Saving…" : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      {/* category modal */}
      {cOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setCOpen(false)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-xl max-h-[88vh] overflow-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-display text-xl">{cEditId ? "Edit category" : "Add category"}</h3>
              <button onClick={() => setCOpen(false)} className="text-muted-foreground hover:text-foreground text-xl">✕</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
              <div><label className={lbl}>Title</label><input value={cDraft.title ?? ""} onChange={(e) => setCDraft({ ...cDraft, title: e.target.value })} className={inputCls} placeholder="Kids" /></div>
              <div><label className={lbl}>Age range</label><input value={cDraft.age ?? ""} onChange={(e) => setCDraft({ ...cDraft, age: e.target.value })} className={inputCls} placeholder="Ages 6 – 12" /></div>
              <div className="md:col-span-2">
                <label className={lbl}>Image</label>
                <div className="flex items-center gap-4">
                  <img src={cDraft.image ? resolveImage(cDraft.image) : (cCurrentImage || resolveImage(undefined))} alt="" className="w-24 h-16 object-cover rounded-md border border-border shrink-0" />
                  <div className="flex-1 space-y-2">
                    <input type="file" accept="image/*" onChange={(e) => onCategoryImage(e.target.files?.[0])} className="block w-full text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-gold file:text-primary-foreground file:text-sm file:font-semibold" />
                    <select value={IMAGE_KEYS.includes(cDraft.image ?? "") ? cDraft.image : ""} onChange={(e) => e.target.value && setCDraft({ ...cDraft, image: e.target.value })} className={inputCls}>
                      <option value="">— ose zgjidh një preset —</option>
                      {IMAGE_KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
                    </select>
                    {uploading && <p className="text-xs text-muted-foreground">Uploading…</p>}
                  </div>
                </div>
              </div>
              <div className="md:col-span-2"><label className={lbl}>Short description (card)</label><input value={cDraft.description ?? ""} onChange={(e) => setCDraft({ ...cDraft, description: e.target.value })} className={inputCls} /></div>
              <div className="md:col-span-2"><label className={lbl}>About (category page)</label><textarea rows={3} value={cDraft.about ?? ""} onChange={(e) => setCDraft({ ...cDraft, about: e.target.value })} className={inputCls} /></div>
              <div className="md:col-span-2"><label className={lbl}>Highlights (one per line)</label><textarea rows={4} value={cDraft.highlights ?? ""} onChange={(e) => setCDraft({ ...cDraft, highlights: e.target.value })} className={inputCls} /></div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => setCOpen(false)} className="text-sm border border-border rounded-lg px-4 py-2 text-muted-foreground hover:border-gold hover:text-gold">Cancel</button>
              <button onClick={saveC} disabled={busy} className="text-sm bg-gold text-primary-foreground font-semibold rounded-lg px-4 py-2 hover:bg-gold-light disabled:opacity-60">{busy ? "Saving…" : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      {/* summer modal */}
      {sOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setSOpen(false)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-display text-xl">{sEditId ? "Edit program" : "Add program"}</h3>
              <button onClick={() => setSOpen(false)} className="text-muted-foreground hover:text-foreground text-xl">✕</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
              <div className="md:col-span-2"><label className={lbl}>Title</label><input value={sDraft.title ?? ""} onChange={(e) => setSDraft({ ...sDraft, title: e.target.value })} className={inputCls} placeholder="Screen Intensive" /></div>
              <div><label className={lbl}>Audience</label><input value={sDraft.audience ?? ""} onChange={(e) => setSDraft({ ...sDraft, audience: e.target.value })} className={inputCls} placeholder="Teens" /></div>
              <div><label className={lbl}>Duration</label><input value={sDraft.duration ?? ""} onChange={(e) => setSDraft({ ...sDraft, duration: e.target.value })} className={inputCls} placeholder="4 weeks" /></div>
              <div><label className={lbl}>Start</label><input value={sDraft.start ?? ""} onChange={(e) => setSDraft({ ...sDraft, start: e.target.value })} className={inputCls} placeholder="Jul 6" /></div>
              <div><label className={lbl}>Status</label><input value={sDraft.status ?? ""} onChange={(e) => setSDraft({ ...sDraft, status: e.target.value })} className={inputCls} placeholder="12 Seats" /></div>
              <div><label className={lbl}>Price ($)</label><input type="number" value={sDraft.price ?? ""} onChange={(e) => setSDraft({ ...sDraft, price: +e.target.value })} className={inputCls} placeholder="2950" /></div>
              <label className="flex items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={!!sDraft.highlight} onChange={(e) => setSDraft({ ...sDraft, highlight: e.target.checked })} className="accent-[hsl(var(--gold))] w-4 h-4" /> Highlight (gold badge)</label>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => setSOpen(false)} className="text-sm border border-border rounded-lg px-4 py-2 text-muted-foreground hover:border-gold hover:text-gold">Cancel</button>
              <button onClick={saveS} disabled={busy} className="text-sm bg-gold text-primary-foreground font-semibold rounded-lg px-4 py-2 hover:bg-gold-light disabled:opacity-60">{busy ? "Saving…" : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Admin = () => {
  const { loading, authenticated, email, login, logout } = useAdminAuth();
  if (loading) {
    return <div className="min-h-screen grid place-items-center bg-background text-muted-foreground">Loading…</div>;
  }
  if (!authenticated) {
    return <AdminLogin onLogin={login} />;
  }
  return <AdminConsole email={email} onLogout={logout} />;
};

export default Admin;
