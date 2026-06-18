import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCatalog } from "@/hooks/useCatalog";
import { createRegistration } from "@/lib/api";

const DETAILS = 0;
const SUMMARY = 1;
const PAYMENT = 2;
const DONE = 3;

const STEP_LABELS = ["Details", "Summary", "Payment", "Done"];

type FormValues = {
  contactName: string;
  phone: string;
  email: string;
  studentName: string;
  dob: string;
  language: string;
  timePreference: string;
  schedule: string;
  photoConsent: boolean;
  rulesConsent: boolean;
};

const inputCls = (err?: boolean) =>
  `w-full bg-background border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors focus:border-gold ${
    err ? "border-red-400" : "border-border"
  }`;

const DEFAULT_PHOTO_CONSENT =
  "Jam dakord që fotot dhe videot e realizuara gjatë klasave dhe shfaqjeve mund të përdoren nga Hollywood School për qëllime edukative dhe promovuese.";
const DEFAULT_RULES =
  "Kam lexuar dhe pranoj rregullat dhe politikat e akademisë, përfshirë pjesëmarrjen, pagesën dhe kodin e sjelljes.";

const Enroll = () => {
  const [params] = useSearchParams();
  const { programSummaries, settings } = useCatalog();
  const [consent, setConsent] = useState<{ title: string; text: string } | null>(null);
  const initialValue = useMemo(() => {
    const c = params.get("c");
    const cat = params.get("cat");
    if (c && programSummaries.some((p) => p.value === c)) return c;
    if (cat) {
      const inCat = programSummaries.find((p) => p.categoryId === cat);
      if (inCat) return inCat.value;
    }
    return programSummaries[0]?.value ?? "";
  }, [params, programSummaries]);
  const summary =
    programSummaries.find((p) => p.value === initialValue) ?? programSummaries[0];

  const [step, setStep] = useState(DETAILS);
  const [confirmation, setConfirmation] = useState<null | {
    code: string;
    name: string;
    email: string;
    course: string;
    schedule?: string;
    paid?: number;
    emailSent?: boolean;
    invoiceUrl?: string | null;
  }>(null);

  const {
    register,
    trigger,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      contactName: "",
      phone: "",
      email: "",
      studentName: "",
      dob: "",
      language: "",
      timePreference: "",
      schedule: "",
      photoConsent: false,
      rulesConsent: false,
    },
  });

  const stepFields: Record<number, (keyof FormValues)[]> = {
    [DETAILS]: [
      "contactName",
      "phone",
      "email",
      "studentName",
      "dob",
      "language",
      "timePreference",
      "schedule",
      "photoConsent",
      "rulesConsent",
    ],
  };

  const goNext = async () => {
    const fields = stepFields[step] ?? [];
    if (fields.length && !(await trigger(fields))) return;
    if (step === PAYMENT) return finish();
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [placing, setPlacing] = useState(false);
  const finish = async () => {
    const v = getValues();
    let code =
      "HS-" + Math.random().toString(36).slice(2, 7).toUpperCase() + "-" + new Date().getFullYear();
    let emailSent = false;
    let invoiceUrl: string | null = null;

    setPlacing(true);
    try {
      const res = await createRegistration({
        contactName: v.contactName,
        phone: v.phone,
        email: v.email,
        studentName: v.studentName,
        dob: v.dob,
        language: v.language,
        timePreference: v.timePreference,
        schedule: v.schedule,
        photoConsent: v.photoConsent,
        rulesConsent: v.rulesConsent,
        programId: summary.value,
        programTitle: summary.title,
        amount: summary.price,
        paymentMethod: "Bank transfer",
      });
      if (res?.confirmation) code = res.confirmation;
      emailSent = !!(res as { emailSent?: boolean })?.emailSent;
      invoiceUrl = res?.invoiceUrl ?? null;
    } catch {
      // backend unavailable — keep the locally generated confirmation code
    } finally {
      setPlacing(false);
    }

    setConfirmation({
      code,
      name: v.studentName || "—",
      email: v.email || "you@email.com",
      course: summary.title,
      schedule: summary.schedule,
      paid: summary.price,
      emailSent,
      invoiceUrl,
    });
    setStep(DONE);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cur = settings.currency_symbol || "$";
  const nextLabel =
    step === SUMMARY ? "Proceed to Payment →" : step === PAYMENT ? (placing ? "Placing order…" : "Place order →") : "Continue →";

  const summaryRows: [string, string][] = [
    ["Category", summary.categoryTitle],
    ["Age group", summary.age],
    ...(summary.level ? ([["Skill level", summary.level]] as [string, string][]) : []),
    ...(summary.duration ? ([["Duration", summary.duration]] as [string, string][]) : []),
    ...(summary.schedule ? ([["Schedule", summary.schedule]] as [string, string][]) : []),
    ...(summary.instructor ? ([["Instructor", summary.instructor]] as [string, string][]) : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-40 pb-20 px-4">
        <div className="max-w-[84rem] mx-auto">
          <nav className="font-body text-sm text-muted-foreground mb-4 flex items-center gap-2">
            <Link to="/" className="hover:text-gold transition-colors">Home</Link>
            <span className="text-muted-foreground/50">/</span>
            <Link to="/classes" className="hover:text-gold transition-colors">Classes</Link>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-foreground">Register</span>
          </nav>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-9">
            Enrollment
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-11 items-start">
            {/* form column */}
            <div>
              {/* stepper */}
              <div className="flex gap-2 mb-10">
                {STEP_LABELS.map((lbl, i) => (
                  <div key={lbl} className="flex-1 flex flex-col gap-2.5">
                    <div
                      className={`h-[3px] rounded-full transition-colors ${
                        i <= step ? "bg-gold" : "bg-muted"
                      }`}
                    />
                    <div
                      className={`text-[0.7rem] uppercase tracking-[0.08em] transition-colors ${
                        i === step ? "text-gold" : i < step ? "text-muted-foreground" : "text-muted-foreground/50"
                      }`}
                    >
                      {lbl}
                    </div>
                  </div>
                ))}
              </div>

              {/* STEP: DETAILS + PREFERENCES (combined) */}
              {step === DETAILS && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-1">Të dhënat</h2>
                  <p className="font-body text-muted-foreground mb-7">Kontakti, nxënësi dhe preferencat — gjithçka në një vend.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="Emri i plotë i kontaktit" req full error={errors.contactName?.message}>
                      <input className={inputCls(!!errors.contactName)} {...register("contactName", { required: "Kjo fushë është e detyrueshme" })} />
                    </Field>
                    <Field label="Numri i telefonit" req error={errors.phone?.message}>
                      <input type="tel" className={inputCls(!!errors.phone)} {...register("phone", { required: "Kjo fushë është e detyrueshme", minLength: { value: 6, message: "Numër i pavlefshëm" } })} />
                    </Field>
                    <Field label="Email" req error={errors.email?.message}>
                      <input type="email" className={inputCls(!!errors.email)} {...register("email", { required: "Kjo fushë është e detyrueshme", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email i pavlefshëm" } })} />
                    </Field>
                    <Field label="Emri i plotë i nxënësit" req error={errors.studentName?.message}>
                      <input className={inputCls(!!errors.studentName)} {...register("studentName", { required: "Kjo fushë është e detyrueshme" })} />
                    </Field>
                    <Field label="Ditëlindja e nxënësit" req error={errors.dob?.message}>
                      <input
                        inputMode="numeric"
                        placeholder="01/01/1990"
                        className={inputCls(!!errors.dob)}
                        {...register("dob", {
                          required: "Kjo fushë është e detyrueshme",
                          pattern: { value: /^\d{2}\/\d{2}\/\d{4}$/, message: "Formati: DD/MM/VVVV" },
                          validate: (v) => {
                            const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v);
                            if (!m) return "Formati: DD/MM/VVVV";
                            const d = +m[1], mo = +m[2], y = +m[3];
                            const now = new Date().getFullYear();
                            if (d < 1 || d > 31 || mo < 1 || mo > 12 || y < 1940 || y > now) return "Datë e pavlefshme";
                            return true;
                          },
                        })}
                        onChange={(e) => {
                          let v = e.target.value.replace(/\D/g, "").slice(0, 8);
                          if (v.length > 4) v = v.slice(0, 2) + "/" + v.slice(2, 4) + "/" + v.slice(4);
                          else if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
                          setValue("dob", v);
                        }}
                      />
                    </Field>
                  </div>

                  <h3 className="font-display text-lg font-bold text-foreground mt-9 mb-4">Preferencat</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="Në cilën nga gjuhët e mëposhtme personi që kërkon regjistrim është i aftë?" req full error={errors.language?.message}>
                      <select className={inputCls(!!errors.language)} {...register("language", { required: "Zgjidhni një opsion" })}>
                        <option value="">Zgjidhni…</option>
                        <option value="ENG">English (ENG)</option>
                        <option value="ALB">Shqip (ALB)</option>
                        <option value="BOTH">Të dyja</option>
                      </select>
                    </Field>
                    <Field label="Preferenca e orës së klasës" req error={errors.timePreference?.message}>
                      <select className={inputCls(!!errors.timePreference)} {...register("timePreference", { required: "Zgjidhni një opsion" })}>
                        <option value="">Zgjidhni…</option>
                        <option>Paradite</option>
                        <option>Pasdite</option>
                        <option>Mbrëmje</option>
                      </select>
                    </Field>
                    <Field label="Zgjidhni orarin më të mirë për ju" req error={errors.schedule?.message}>
                      <select className={inputCls(!!errors.schedule)} {...register("schedule", { required: "Zgjidhni një opsion" })}>
                        <option value="">Zgjidhni…</option>
                        <option>E hënë – E premte</option>
                        <option>Vetëm fundjavë</option>
                        <option>Fleksibël</option>
                      </select>
                    </Field>
                    <div className="sm:col-span-2 flex items-start gap-3">
                      <input id="photoConsent" type="checkbox" className="mt-1 accent-[hsl(var(--gold))] w-4 h-4" {...register("photoConsent", { required: "Kërkohet pëlqimi" })} />
                      <div className="font-body text-sm text-muted-foreground">
                        <label htmlFor="photoConsent" className="cursor-pointer">Pëlqimi për foto/video <span className="text-gold">*</span></label>
                        {" — "}
                        <button type="button" onClick={() => setConsent({ title: "Pëlqimi për foto/video", text: settings.photo_consent_text || DEFAULT_PHOTO_CONSENT })} className="text-gold underline hover:text-gold-light">shiko</button>
                        {errors.photoConsent && <span className="block text-red-400 text-xs mt-1">{errors.photoConsent.message}</span>}
                      </div>
                    </div>
                    <div className="sm:col-span-2 flex items-start gap-3">
                      <input id="rulesConsent" type="checkbox" className="mt-1 accent-[hsl(var(--gold))] w-4 h-4" {...register("rulesConsent", { required: "Duhet të konfirmoni rregullat" })} />
                      <div className="font-body text-sm text-muted-foreground">
                        <label htmlFor="rulesConsent" className="cursor-pointer">Konfirmimi i rregullave <span className="text-gold">*</span></label>
                        {" — "}
                        <button type="button" onClick={() => setConsent({ title: "Rregullat", text: settings.rules_text || DEFAULT_RULES })} className="text-gold underline hover:text-gold-light">shiko</button>
                        {errors.rulesConsent && <span className="block text-red-400 text-xs mt-1">{errors.rulesConsent.message}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP: SUMMARY */}
              {step === SUMMARY && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-1">Përmbledhje</h2>
                  <p className="font-body text-muted-foreground mb-7">Rishikoni regjistrimin para pagesës.</p>
                  <div className="bg-card border border-border rounded-xl divide-y divide-border">
                    {([
                      ["Programi", summary.title],
                      ["Emri i kontaktit", getValues("contactName")],
                      ["Telefoni", getValues("phone")],
                      ["Email", getValues("email")],
                      ["Nxënësi", getValues("studentName")],
                      ["Ditëlindja", getValues("dob")],
                      ["Gjuha", getValues("language")],
                      ["Preferenca e orës", getValues("timePreference")],
                      ["Orari", getValues("schedule")],
                    ] as [string, string][]).map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4 px-5 py-3 text-sm">
                        <span className="text-muted-foreground">{k}</span>
                        <span className="text-foreground text-right">{v || "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP: PAYMENT (bank transfer + invoice) */}
              {step === PAYMENT && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-1">Pagesa — Transfer bankar</h2>
                  <p className="font-body text-muted-foreground mb-6">
                    Sapo të bësh porosinë, do të të dërgojmë me <b>email</b> një <b>faturë PDF</b> me të dhënat e mëposhtme. Vendi konfirmohet pasi të marrim transferin.
                  </p>

                  <div className="rounded-xl border border-gold/40 bg-gold/5 p-6">
                    <p className="font-body text-xs uppercase tracking-[0.18em] text-gold mb-4">Të dhënat bankare</p>
                    <dl className="font-body text-sm divide-y divide-border">
                      {([
                        ["Pronari i llogarisë", settings.bank_holder],
                        ["Banka", settings.bank_name],
                        ["IBAN", settings.bank_iban],
                        ...(settings.bank_swift ? ([["SWIFT/BIC", settings.bank_swift]] as [string, string][]) : []),
                      ] as [string, string][]).map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-4 py-2.5">
                          <dt className="text-muted-foreground">{k}</dt>
                          <dd className="text-foreground font-semibold text-right">{v || "—"}</dd>
                        </div>
                      ))}
                      <div className="flex justify-between gap-4 py-2.5">
                        <dt className="text-muted-foreground">Shuma</dt>
                        <dd className="text-gold font-bold text-right">{summary.price != null ? `${cur}${summary.price.toLocaleString()}` : "—"}</dd>
                      </div>
                    </dl>
                  </div>
                  <p className="font-body text-sm text-muted-foreground mt-4">{settings.invoice_note}</p>
                </div>
              )}

              {/* STEP: DONE */}
              {step === DONE && confirmation && (
                <div className="text-center py-6">
                  <div className="w-20 h-20 rounded-full bg-emerald-400/10 border border-emerald-400 flex items-center justify-center mx-auto mb-6 text-emerald-400 text-4xl">✓</div>
                  <h2 className="font-display text-3xl font-bold text-foreground">Porosia u krye</h2>
                  <p className="font-body text-muted-foreground max-w-md mx-auto mt-3">
                    {confirmation.invoiceUrl
                      ? "Fatura jote PDF me të dhënat bankare është gati — shkarkoje më poshtë. Paguaje me transfer dhe e konfirmojmë vendin."
                      : "Regjistrimi u ruajt. Të dhënat bankare janë më poshtë — paguaje me transfer."}
                  </p>
                  <div className="text-left max-w-md mx-auto mt-7 bg-card border border-border rounded-xl p-6 divide-y divide-border">
                    {([
                      ["Fatura #", confirmation.code],
                      ["Nxënësi", confirmation.name],
                      ["Programi", confirmation.course],
                      ...(confirmation.schedule ? ([["Orari", confirmation.schedule]] as [string, string][]) : []),
                      ["Për t'u paguar", confirmation.paid != null ? `${cur}${confirmation.paid.toLocaleString()}` : "—"],
                      ["IBAN", settings.bank_iban],
                      ["Referenca", confirmation.code],
                    ] as [string, string][]).map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4 py-2.5 text-sm">
                        <span className="text-muted-foreground">{k}</span>
                        <span className="text-foreground font-semibold text-right">{v}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-5">
                    ✉ Një kopje do të dërgohet edhe te <span className="text-gold">{confirmation.email}</span>
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center mt-8">
                    {confirmation.invoiceUrl && (
                      <a href={confirmation.invoiceUrl} target="_blank" rel="noopener noreferrer" className="bg-gold text-primary-foreground font-display font-bold uppercase rounded-full px-6 py-3 hover:bg-gold-light transition-colors">
                        ⬇ Shkarko faturën (PDF)
                      </a>
                    )}
                    <Link to="/" className={`font-display font-bold uppercase rounded-full px-6 py-3 transition-colors ${confirmation.invoiceUrl ? "border border-border text-foreground hover:border-gold hover:text-gold" : "bg-gold text-primary-foreground hover:bg-gold-light"}`}>Back to Home</Link>
                    <Link to="/classes" className="border border-border text-foreground font-display font-bold uppercase rounded-full px-6 py-3 hover:border-gold hover:text-gold transition-colors">Browse Classes</Link>
                  </div>
                </div>
              )}

              {/* nav */}
              {step !== DONE && (
                <div className="flex justify-between gap-4 mt-9">
                  <button
                    type="button"
                    onClick={goBack}
                    className={`border border-border text-foreground font-display font-bold uppercase rounded-full px-6 py-3 hover:border-gold hover:text-gold transition-colors ${
                      step === DETAILS ? "invisible" : ""
                    }`}
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={placing}
                    className="bg-gold text-primary-foreground font-display font-bold uppercase rounded-full px-7 py-3 hover:bg-gold-light transition-colors disabled:opacity-60"
                  >
                    {nextLabel}
                  </button>
                </div>
              )}
            </div>

            {/* order summary */}
            <aside className="bg-card border border-border rounded-xl overflow-hidden lg:sticky lg:top-24">
              <div className="aspect-[16/9] overflow-hidden">
                <img src={summary.image} alt={summary.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-6">
                <p className="font-body text-xs uppercase tracking-[0.18em] text-gold mb-2">Your Enrollment</p>
                <h3 className="font-display text-2xl font-bold text-foreground mb-4">{summary.title}</h3>
                <dl className="font-body text-sm divide-y divide-border">
                  {summaryRows.map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 py-3">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="text-foreground text-right">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="flex justify-between items-baseline mt-5">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-display text-3xl text-gold">
                    {summary.price != null ? `$${summary.price.toLocaleString()}` : "—"}
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {consent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setConsent(null)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-display text-xl">{consent.title}</h3>
              <button onClick={() => setConsent(null)} className="text-muted-foreground hover:text-foreground text-xl">✕</button>
            </div>
            <div className="p-6 font-body text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{consent.text}</div>
            <div className="flex justify-end px-6 py-4 border-t border-border">
              <button onClick={() => setConsent(null)} className="bg-gold text-primary-foreground font-display font-bold uppercase rounded-full px-6 py-2.5 hover:bg-gold-light transition-colors">Mbyll</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

const Field = ({
  label,
  req,
  full,
  error,
  children,
}: {
  label: string;
  req?: boolean;
  full?: boolean;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className={full ? "sm:col-span-2" : ""}>
    <label className="block font-body text-sm text-foreground mb-2">
      {label} {req && <span className="text-gold">*</span>}
    </label>
    {children}
    {error && <span className="block text-red-400 text-xs mt-1">{error}</span>}
  </div>
);

export default Enroll;
