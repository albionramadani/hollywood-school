import { Link } from "react-router-dom";
import type { Course } from "@/data/programs";

interface CourseCardProps {
  course: Course;
  age: string;
  image: string;
}

const CourseCard = ({ course, age, image }: CourseCardProps) => {
  return (
    <article className="flex flex-col bg-card border border-border rounded-xl overflow-hidden transition-colors hover:border-gold">
      <div className="aspect-[16/10] overflow-hidden">
        <img
          src={image}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          loading="lazy"
        />
      </div>

      <div className="flex flex-col flex-1 p-6">
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="font-body text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground border border-border rounded-full px-3 py-1">
            {age}
          </span>
          <span className="font-body text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground border border-border rounded-full px-3 py-1">
            {course.level}
          </span>
        </div>

        <h3 className="font-display text-2xl font-bold text-foreground mb-2">
          {course.title}
        </h3>
        <p className="font-body text-sm text-muted-foreground leading-relaxed mb-5">
          {course.description}
        </p>

        <dl className="font-body text-sm border-y border-border py-4 space-y-2 mb-5">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Duration</dt>
            <dd className="text-foreground">{course.duration}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Schedule</dt>
            <dd className="text-foreground">{course.schedule}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Instructor</dt>
            <dd className="text-foreground">{course.instructor}</dd>
          </div>
        </dl>

        <div className="mb-5 mt-auto">
          <div className="font-display text-2xl text-gold leading-none">
            ${course.price.toLocaleString()}
            <span className="font-body text-xs uppercase tracking-wide text-muted-foreground ml-1">
              tuition
            </span>
          </div>
        </div>

        <Link
          to={`/enroll?c=${course.id}`}
          className="w-full text-center bg-gold text-primary-foreground font-display font-bold uppercase tracking-wide rounded-full py-2.5 hover:bg-gold-light transition-colors"
        >
          Register
        </Link>
      </div>
    </article>
  );
};

export default CourseCard;
