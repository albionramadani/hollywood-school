import { Link } from "react-router-dom";
import { useCatalog } from "@/hooks/useCatalog";

const TestimonialSection = () => {
  const { testimonials } = useCatalog();
  const t = testimonials.find((x) => x.featured) ?? testimonials[0];
  if (!t) return null;

  return (
    <section id="testimonials" className="bg-dark-surface py-24 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <p className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground mb-8">
          Why Families Choose Us
        </p>

        <blockquote className="font-display italic text-3xl md:text-4xl lg:text-5xl text-foreground leading-snug mb-10">
          &ldquo;{t.quote}&rdquo;
        </blockquote>

        <div className="flex items-center justify-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold font-body font-semibold text-sm">
            {t.initials}
          </div>
          <div className="text-left">
            <div className="font-body font-bold text-foreground">{t.name}</div>
            <div className="font-body text-sm text-muted-foreground">{t.role}</div>
          </div>
        </div>

        <div className="mt-9">
          <Link
            to="/testimonials"
            className="font-body text-sm uppercase tracking-[0.15em] text-gold hover:text-gold-light transition-colors"
          >
            Read More Stories →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
