import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { summerAcademy } from "@/data/programs";
import { useCatalog } from "@/hooks/useCatalog";

const pad = (n: number) => String(n).padStart(2, "0");

const useCountdown = (target: string) => {
  const remaining = () => Math.max(0, new Date(target).getTime() - Date.now());
  const [left, setLeft] = useState(remaining);

  useEffect(() => {
    const id = setInterval(() => setLeft(remaining()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return {
    days: Math.floor(left / 864e5),
    hours: Math.floor((left % 864e5) / 36e5),
    mins: Math.floor((left % 36e5) / 6e4),
    secs: Math.floor((left % 6e4) / 1e3),
  };
};

const SummerAcademySection = () => {
  const { summerPrograms, settings } = useCatalog();
  const cur = settings.currency_symbol || "$";
  const { days, hours, mins, secs } = useCountdown(summerAcademy.deadline);

  const units = [
    { value: days, label: "Days" },
    { value: hours, label: "Hours" },
    { value: mins, label: "Mins" },
    { value: secs, label: "Secs" },
  ];

  return (
    <section id="summer" className="bg-background py-20 px-4 border-y border-border">
      <div className="max-w-[84rem] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* left — pitch + countdown */}
        <div>
          <p className="font-body text-sm uppercase tracking-[0.25em] text-gold mb-4">
            Seasonal Intensives
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground leading-tight mb-5">
            Summer Academy{" "}
            <span className="text-gold italic">{summerAcademy.year}</span>
          </h2>
          <p className="font-body text-muted-foreground leading-relaxed text-base md:text-lg max-w-md mb-8">
            Four weeks of total immersion — daily on-set work, a showcase
            performance, and a finished scene for your reel. Limited to{" "}
            {summerAcademy.capacity} students.
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            {units.map((u) => (
              <div
                key={u.label}
                className="bg-card border border-border rounded-lg px-5 py-4 text-center min-w-[78px]"
              >
                <div className="font-display text-3xl font-bold text-gold leading-none">
                  {pad(u.value)}
                </div>
                <div className="font-body text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground mt-2">
                  {u.label}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* right — program list */}
        <div className="flex flex-col gap-3.5">
          {summerPrograms.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-4 bg-card border border-border rounded-lg px-5 py-4 transition-colors hover:border-gold"
            >
              <div className="min-w-0">
                <div className="font-body font-semibold text-foreground">{p.title}</div>
                <div className="font-body text-sm text-muted-foreground">
                  {p.audience} · {p.duration} · {p.start}
                </div>
                <div className="font-body text-xs text-gold mt-1">{p.status}</div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="font-display text-xl text-gold leading-none">
                  {p.price != null ? `${cur}${p.price.toLocaleString()}` : "—"}
                </div>
                <Link
                  to={`/enroll?c=${p.id}`}
                  className="font-body text-xs font-semibold uppercase tracking-wide bg-gold text-primary-foreground rounded-full px-4 py-1.5 hover:bg-gold-light transition-colors whitespace-nowrap"
                >
                  Register Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SummerAcademySection;
