import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { type TestimonialCategory } from "@/data/programs";
import { useCatalog } from "@/hooks/useCatalog";

import kidsImage from "@/assets/class-kids.jpg";
import teensImage from "@/assets/class-teens.jpg";
import adultsImage from "@/assets/class-adults.jpg";
import stageImage from "@/assets/hero-stage.jpg";

const SLIDE_IMAGES = [adultsImage, stageImage, teensImage, kidsImage];

const Stars = ({ n = 5, size = "text-base" }: { n?: number; size?: string }) => (
  <div className={`flex gap-1 text-gold ${size}`} aria-label={`${n} out of 5`}>
    {Array.from({ length: n }).map((_, i) => (
      <span key={i}>★</span>
    ))}
  </div>
);

const Avatar = ({ initials, size = "w-12 h-12" }: { initials: string; size?: string }) => (
  <div className={`${size} rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold font-body font-semibold text-sm shrink-0`}>
    {initials}
  </div>
);

const FILTERS: { id: "all" | TestimonialCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "student", label: "Students" },
  { id: "parent", label: "Parents" },
  { id: "success", label: "Success Stories" },
];

const Testimonials = () => {
  const { testimonials } = useCatalog();
  const featured = testimonials.filter((t) => t.featured);
  const [cur, setCur] = useState(0);
  const [filter, setFilter] = useState<"all" | TestimonialCategory>("all");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setCur((c) => (c + 1) % featured.length), 6000);
    return () => clearInterval(id);
  }, [featured.length]);

  const visible = testimonials.filter((t) => filter === "all" || t.category === filter);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* hero */}
      <section className="relative pt-40 pb-16 px-4 overflow-hidden border-b border-border">
        <img src={stageImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/60" />
        <div className="relative max-w-[84rem] mx-auto">
          <nav className="font-body text-sm text-muted-foreground mb-5 flex items-center gap-2">
            <Link to="/" className="hover:text-gold transition-colors">Home</Link>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-foreground">Testimonials</span>
          </nav>
          <p className="font-body text-xs uppercase tracking-[0.22em] text-gold mb-3">In Their Words</p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground mb-5">
            Stories from our stages and sets.
          </h1>
          <div className="flex items-center gap-4">
            <Stars n={5} size="text-xl" />
            <span className="font-body text-muted-foreground">4.9 / 5 · 380+ reviews</span>
          </div>
        </div>
      </section>

      {/* featured carousel */}
      <section className="py-14 px-4">
        <div className="max-w-[84rem] mx-auto">
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${cur * 100}%)` }}>
              {featured.map((t, i) => (
                <div key={t.id} className="min-w-full grid md:grid-cols-[0.8fr_1.4fr] bg-card">
                  <div className="relative min-h-[240px] md:min-h-full">
                    <img src={SLIDE_IMAGES[i % SLIDE_IMAGES.length]} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-background/30" />
                  </div>
                  <div className="p-8 md:p-12 flex flex-col justify-center gap-5">
                    <Stars n={t.rating ?? 5} size="text-xl" />
                    <p className="font-display italic text-2xl md:text-3xl text-foreground leading-snug">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3.5">
                      <Avatar initials={t.initials} size="w-14 h-14" />
                      <div>
                        <div className="font-body font-bold text-foreground text-lg">{t.name}</div>
                        <div className="font-body text-sm text-gold">{t.role}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="flex gap-2">
              {featured.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Slide ${i + 1}`}
                  onClick={() => setCur(i)}
                  className={`h-2.5 rounded-full transition-all ${i === cur ? "w-7 bg-gold" : "w-2.5 bg-muted"}`}
                />
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCur((c) => (c - 1 + featured.length) % featured.length)} aria-label="Previous" className="w-12 h-12 rounded-full border border-border text-foreground hover:border-gold hover:text-gold transition-colors">‹</button>
              <button onClick={() => setCur((c) => (c + 1) % featured.length)} aria-label="Next" className="w-12 h-12 rounded-full border border-border text-foreground hover:border-gold hover:text-gold transition-colors">›</button>
            </div>
          </div>
        </div>
      </section>

      {/* grid */}
      <section className="pb-16 px-4">
        <div className="max-w-[84rem] mx-auto">
          <p className="font-body text-xs uppercase tracking-[0.22em] text-gold mb-3">More Voices</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">Read the reviews</h2>

          <div className="flex flex-wrap gap-3 mb-9">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`font-body text-sm rounded-full px-5 py-2 border transition-colors ${
                  filter === f.id ? "bg-gold text-primary-foreground border-gold font-semibold" : "text-muted-foreground border-border hover:border-gold hover:text-gold"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {visible.map((t) => (
              <div key={t.id} className="bg-card border border-border rounded-xl p-7 flex flex-col gap-4">
                <Stars n={t.rating ?? 5} size="text-sm" />
                <p className="font-body text-muted-foreground leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <Avatar initials={t.initials} size="w-11 h-11" />
                  <div>
                    <div className="font-body font-semibold text-foreground text-sm">{t.name}</div>
                    <div className="font-body text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* cta */}
      <section className="py-20 px-4 bg-dark-surface text-center">
        <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-7">Write your own story.</h2>
        <Link to="/enroll" className="inline-block bg-gold text-primary-foreground font-display font-bold uppercase rounded-full px-8 py-3 text-lg hover:bg-gold-light transition-colors">
          Register Now →
        </Link>
      </section>

      <Footer />
    </div>
  );
};

export default Testimonials;
