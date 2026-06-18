import { Link } from "react-router-dom";
import { useCatalog } from "@/hooks/useCatalog";

const ClassesSection = () => {
  const { categories, settings } = useCatalog();
  const eyebrow = settings.classes_eyebrow || "Find Your Stage";
  const heading = settings.classes_heading || "Programs for every age\nand every ambition.";
  return (
    <section id="classes" className="bg-dark-surface py-20 px-4">
      <div className="max-w-[84rem] mx-auto">
        {/* heading row */}
        <div className="flex flex-wrap items-end justify-between gap-5 mb-12">
          <div>
            <p className="font-body text-sm uppercase tracking-[0.25em] text-gold mb-3">
              {eyebrow}
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground leading-tight whitespace-pre-line">
              {heading}
            </h2>
          </div>
          <a
            href="#classes"
            className="font-body text-sm uppercase tracking-[0.15em] text-gold hover:text-gold-light transition-colors"
          >
            All Classes →
          </a>
        </div>

        {/* category cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cls) => (
            <Link
              key={cls.id}
              to={cls.href}
              className="group relative rounded-xl overflow-hidden bg-card aspect-[3/4]"
            >
              <img
                src={cls.image}
                alt={`${cls.title} acting class`}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="font-body text-xs uppercase tracking-[0.18em] text-gold mb-2">
                  {cls.age}
                </p>
                <h3 className="font-display text-3xl font-bold text-foreground leading-none mb-3">
                  {cls.title}
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">
                  {cls.description}
                </p>
                <span className="font-body text-xs font-semibold uppercase tracking-[0.12em] text-gold group-hover:text-gold-light transition-colors">
                  Explore Classes →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClassesSection;
