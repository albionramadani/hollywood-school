import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MEDIA_CATEGORY_LABEL, type MediaCategory } from "@/data/programs";
import { useCatalog } from "@/hooks/useCatalog";

import stageImage from "@/assets/hero-stage.jpg";

const FILTERS: { id: "all" | MediaCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "photos", label: "Photos" },
  { id: "videos", label: "Videos" },
  { id: "performances", label: "Student Performances" },
  { id: "bts", label: "Behind The Scenes" },
];

const Play = ({ big }: { big?: boolean }) => (
  <div className="absolute inset-0 flex items-center justify-center z-[2]">
    <span className={`${big ? "w-16 h-16" : "w-14 h-14"} rounded-full bg-background/60 border border-white/30 backdrop-blur flex items-center justify-center text-foreground`}>
      ▶
    </span>
  </div>
);

const Media = () => {
  const { mediaItems } = useCatalog();
  const [filter, setFilter] = useState<"all" | MediaCategory>("all");
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const current = mediaItems.filter((m) => filter === "all" || m.category === filter);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowLeft") setLightbox((i) => (i === null ? i : (i - 1 + current.length) % current.length));
      if (e.key === "ArrowRight") setLightbox((i) => (i === null ? i : (i + 1) % current.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, current.length]);

  const active = lightbox !== null ? current[lightbox] : null;

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
            <span className="text-foreground">Media</span>
          </nav>
          <p className="font-body text-xs uppercase tracking-[0.22em] text-gold mb-3">Inside The Academy</p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground mb-5">
            The work, the room, the moments between.
          </h1>
          <p className="font-body text-muted-foreground leading-relaxed text-base md:text-lg max-w-2xl">
            Performances, classes, and behind-the-scenes from our stages and sets.
          </p>
        </div>
      </section>

      {/* gallery */}
      <section className="py-14 px-4">
        <div className="max-w-[84rem] mx-auto">
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

          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {current.map((m, i) => (
              <button
                key={m.id}
                onClick={() => setLightbox(i)}
                className="group relative w-full mb-4 block break-inside-avoid rounded-xl overflow-hidden border border-border"
              >
                <img src={m.image} alt={m.title} className="w-full block transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                {m.video && <Play />}
                <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute left-4 right-4 bottom-4 z-[2] text-left opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                  <div className="font-body font-semibold text-foreground text-sm">{m.title}</div>
                  <div className="font-body text-[0.7rem] uppercase tracking-[0.1em] text-gold mt-1">{MEDIA_CATEGORY_LABEL[m.category]}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {/* lightbox */}
      {active && (
        <div
          className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur flex items-center justify-center p-6 md:p-10"
          onClick={(e) => e.target === e.currentTarget && setLightbox(null)}
        >
          <button onClick={() => setLightbox(null)} aria-label="Close" className="absolute top-6 right-6 w-11 h-11 rounded-full border border-border bg-card text-foreground hover:border-gold hover:text-gold transition-colors">✕</button>
          <button onClick={() => setLightbox((i) => (i! - 1 + current.length) % current.length)} aria-label="Previous" className="hidden sm:flex absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-border bg-card text-foreground items-center justify-center text-xl hover:border-gold hover:text-gold transition-colors">‹</button>
          <button onClick={() => setLightbox((i) => (i! + 1) % current.length)} aria-label="Next" className="hidden sm:flex absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-border bg-card text-foreground items-center justify-center text-xl hover:border-gold hover:text-gold transition-colors">›</button>

          <div className="max-w-4xl w-full">
            <div className="relative rounded-xl overflow-hidden border border-border bg-black">
              <img src={active.image} alt={active.title} className="w-full max-h-[72vh] object-contain block" />
              {active.video && (
                <div className="absolute left-0 right-0 bottom-0 p-4 flex items-center gap-3 bg-gradient-to-t from-black/90 to-transparent">
                  <span className="w-9 h-9 rounded-full bg-gold text-primary-foreground flex items-center justify-center text-sm">▶</span>
                  <div className="flex-1 h-1 rounded-full bg-white/20"><div className="h-full w-1/3 bg-gold rounded-full" /></div>
                  <span className="text-xs text-muted-foreground">1:24 / 3:58</span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-end gap-5 mt-4">
              <div>
                <span className="font-body text-xs uppercase tracking-[0.18em] text-gold">{MEDIA_CATEGORY_LABEL[active.category]}</span>
                <h3 className="font-display text-2xl font-bold text-foreground mt-1">{active.title}</h3>
              </div>
              <span className="font-body text-sm text-muted-foreground">{lightbox! + 1} / {current.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Media;
