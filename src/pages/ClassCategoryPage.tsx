import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import NotFound from "@/pages/NotFound";
import { useCatalog } from "@/hooks/useCatalog";

const ClassCategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { categories, coursesByCategory } = useCatalog();
  const category = categories.find((c) => c.id === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!category) return <NotFound />;

  const courses = coursesByCategory[category.id] ?? [];
  const fromPrice = courses.length ? Math.min(...courses.map((c) => c.price)) : 0;
  // Kids with 1–2 classes: show a simple "single class" register layout.
  // With 3+ it falls back to the normal grid like every other category.
  const singleMode = category.id === "kids" && courses.length > 0 && courses.length <= 2;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* hero */}
      <section className="relative pt-40 pb-16 px-4 overflow-hidden border-b border-border">
        <img
          src={category.image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/60" />
        <div className="relative max-w-[84rem] mx-auto">
          <nav className="font-body text-sm text-muted-foreground mb-5 flex items-center gap-2">
            <Link to="/" className="hover:text-gold transition-colors">Home</Link>
            <span className="text-muted-foreground/50">/</span>
            <Link to="/#classes" className="hover:text-gold transition-colors">Classes</Link>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-foreground">{category.title}</span>
          </nav>
          <p className="font-body text-xs uppercase tracking-[0.22em] text-gold mb-3">
            {category.age}
          </p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground mb-5">
            {category.title}
          </h1>
          <p className="font-body text-muted-foreground leading-relaxed text-base md:text-lg max-w-2xl">
            {category.about}
          </p>

          {courses.length > 0 && (
            <div className="flex flex-wrap gap-x-12 gap-y-4 mt-9">
              <div>
                <div className="font-display text-3xl text-gold leading-none">{courses.length}</div>
                <div className="font-body text-xs uppercase tracking-[0.12em] text-muted-foreground mt-2">Courses</div>
              </div>
              <div>
                <div className="font-display text-3xl text-gold leading-none">${fromPrice.toLocaleString()}</div>
                <div className="font-body text-xs uppercase tracking-[0.12em] text-muted-foreground mt-2">From</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* body */}
      {singleMode ? (
        <section className="py-16 px-4">
          <div className="max-w-[84rem] mx-auto space-y-4">
            {courses.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-5 bg-card border border-border rounded-xl p-6 md:p-8">
                <div className="min-w-0">
                  <h3 className="font-display text-2xl font-bold text-foreground">{c.title}</h3>
                  <p className="font-body text-sm text-muted-foreground mt-1">{c.level} · {c.duration} · {c.schedule}</p>
                  <p className="font-body text-sm text-muted-foreground mt-3 max-w-2xl">{c.description}</p>
                </div>
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <div className="font-display text-3xl text-gold leading-none">${c.price.toLocaleString()}</div>
                  <Link
                    to={`/enroll?c=${c.id}`}
                    className="bg-gold text-primary-foreground font-display font-bold uppercase rounded-full px-7 py-3 hover:bg-gold-light transition-colors whitespace-nowrap"
                  >
                    Register Now →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="py-16 px-4">
          <div className="max-w-[84rem] mx-auto">
            <p className="font-body text-xs uppercase tracking-[0.22em] text-gold mb-3">
              Current Term
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-10">
              {category.title} courses
            </h2>
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    age={category.age}
                    image={category.image}
                  />
                ))}
              </div>
            ) : (
              <p className="font-body text-muted-foreground">Courses for this program are coming soon.</p>
            )}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default ClassCategoryPage;
