import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { useCatalog } from "@/hooks/useCatalog";
import heroImage from "@/assets/hero-stage.jpg";

const Classes = () => {
  const { categories: classCategories, coursesByCategory } = useCatalog();
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categoriesWithCourses = classCategories.filter(
    (c) => (coursesByCategory[c.id]?.length ?? 0) > 0
  );
  const filters = [
    { id: "all", title: "All" },
    ...categoriesWithCourses.map((c) => ({ id: c.id, title: c.title })),
  ];

  const allCourses = classCategories.flatMap((cat) =>
    (coursesByCategory[cat.id] ?? []).map((course) => ({ course, cat }))
  );
  const visible = allCourses.filter(
    ({ cat }) => filter === "all" || cat.id === filter
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* hero */}
      <section className="relative pt-40 pb-16 px-4 overflow-hidden border-b border-border">
        <img src={heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/60" />
        <div className="relative max-w-[84rem] mx-auto">
          <nav className="font-body text-sm text-muted-foreground mb-5 flex items-center gap-2">
            <Link to="/" className="hover:text-gold transition-colors">Home</Link>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-foreground">Classes</span>
          </nav>
          <p className="font-body text-xs uppercase tracking-[0.22em] text-gold mb-3">
            The Programs
          </p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground mb-5 max-w-3xl">
            Training for every age and every ambition.
          </h1>
          <p className="font-body text-muted-foreground leading-relaxed text-base md:text-lg max-w-2xl">
            Four pathways, taught in small cohorts by working artists. Find the
            right starting point below.
          </p>
        </div>
      </section>

      {/* category pathways */}
      <section className="py-12 px-4">
        <div className="max-w-[84rem] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {classCategories.map((cat) => {
            const count = coursesByCategory[cat.id]?.length ?? 0;
            return (
              <Link
                key={cat.id}
                to={cat.href}
                className="group relative rounded-xl overflow-hidden bg-card aspect-[4/5]"
              >
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="font-body text-xs uppercase tracking-[0.18em] text-gold mb-1">
                    {cat.age}
                  </p>
                  <h3 className="font-display text-2xl font-bold text-foreground leading-none mb-1">
                    {cat.title}
                  </h3>
                  <p className="font-body text-sm text-muted-foreground">
                    {count > 0 ? `${count} courses` : "Enroll directly"}
                  </p>
                  <span className="font-body text-xs font-semibold uppercase tracking-[0.12em] text-gold mt-3 inline-block group-hover:text-gold-light transition-colors">
                    Explore →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* all courses */}
      <section className="pb-20 px-4">
        <div className="max-w-[84rem] mx-auto">
          <p className="font-body text-xs uppercase tracking-[0.22em] text-gold mb-3">
            Browse the Catalogue
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
            All courses
          </h2>

          <div className="flex flex-wrap gap-3 mb-10">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`font-body text-sm rounded-full px-5 py-2 border transition-colors ${
                  filter === f.id
                    ? "bg-gold text-primary-foreground border-gold font-semibold"
                    : "text-muted-foreground border-border hover:border-gold hover:text-gold"
                }`}
              >
                {f.title}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map(({ course, cat }) => (
              <CourseCard
                key={course.id}
                course={course}
                age={cat.age}
                image={cat.image}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Classes;
