import { useState } from "react";
import { Facebook, Instagram } from "lucide-react";
import { toast } from "sonner";
import { useCatalog } from "@/hooks/useCatalog";
import { sendContact } from "@/lib/api";

const ContactSection = () => {
  const { settings } = useCatalog();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [busy, setBusy] = useState(false);

  // Accept either a full <iframe …> snippet or just the src URL.
  const raw = (settings.map_embed || "").trim();
  const srcMatch = raw.match(/src=["']([^"']+)["']/i);
  const mapSrc = (srcMatch ? srcMatch[1] : raw).trim();
  const showMap = /^https?:\/\//i.test(mapSrc);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await sendContact(form);
      if (r.ok) {
        toast.success("Message sent — we'll be in touch soon.");
        setForm({ name: "", email: "", phone: "", message: "" });
      } else {
        toast.error(r.error || "Could not send your message.");
      }
    } catch {
      toast.error("Could not send your message.");
    } finally {
      setBusy(false);
    }
  };

  const input = "w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gold";

  return (
    <section id="contact" className="bg-dark-surface pt-40 pb-20 px-4 min-h-screen">
      <div className="max-w-[84rem] mx-auto">
        <p className="font-body text-sm uppercase tracking-[0.25em] text-gold mb-3">Get In Touch</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-10">Contact us</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* form */}
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input required placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} />
              <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={input} />
            </div>
            <input placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={input} />
            <textarea required rows={5} placeholder="How can we help?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={input} />
            <button type="submit" disabled={busy} className="bg-gold text-primary-foreground font-display font-bold uppercase rounded-full px-8 py-3 hover:bg-gold-light transition-colors disabled:opacity-60">
              {busy ? "Sending…" : "Send message"}
            </button>
          </form>

          {/* map + info */}
          <div className="space-y-5">
            {showMap ? (
              <iframe
                title="Location"
                src={mapSrc}
                className="w-full h-72 rounded-xl border border-border"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="w-full h-72 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground text-sm">
                Map will appear here once configured.
              </div>
            )}
            <div className="font-body text-muted-foreground space-y-1">
              {settings.academy_address && <p>{settings.academy_address}</p>}
              {settings.academy_email && <p><a href={`mailto:${settings.academy_email}`} className="hover:text-gold transition-colors">{settings.academy_email}</a></p>}
              {settings.academy_phone && <p><a href={`tel:${settings.academy_phone}`} className="hover:text-gold transition-colors">{settings.academy_phone}</a></p>}
            </div>

            {(settings.facebook_url || settings.instagram_url) && (
              <div className="flex items-center gap-3 pt-1">
                {settings.facebook_url && (
                  <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 flex items-center justify-center rounded-full border border-border text-foreground hover:border-gold hover:text-gold transition-colors">
                    <Facebook size={18} />
                  </a>
                )}
                {settings.instagram_url && (
                  <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 flex items-center justify-center rounded-full border border-border text-foreground hover:border-gold hover:text-gold transition-colors">
                    <Instagram size={18} />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
