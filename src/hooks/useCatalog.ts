import { useQuery } from "@tanstack/react-query";

import { fetchCatalog } from "@/lib/api";
import { resolveImage } from "@/lib/images";
import {
  classCategories,
  coursesByCategory as mockCoursesByCategory,
  summerPrograms as mockSummer,
  testimonials as mockTestimonials,
  mediaItems as mockMedia,
  programSummaries as mockProgramSummaries,
  type ClassCategory,
  type Course,
  type SummerProgram,
  type Testimonial,
  type MediaItem,
  type ProgramSummary,
} from "@/data/programs";

export type Settings = Record<string, string>;

export interface Catalog {
  categories: ClassCategory[];
  courses: Course[];
  coursesByCategory: Record<string, Course[]>;
  summerPrograms: SummerProgram[];
  testimonials: Testimonial[];
  mediaItems: MediaItem[];
  programSummaries: ProgramSummary[];
  settings: Settings;
}

const MOCK_SETTINGS: Settings = {
  academy_name: "Hollywood School",
  academy_email: "info@hollywoodschool.com",
  academy_phone: "+383 48 734 899",
  academy_address: "Prishtinë, Rr. Gjilani nr.204",
  currency_symbol: "$",
  bank_holder: "Hollywood School",
  bank_name: "Your Bank",
  bank_iban: "XK00 0000 0000 0000 0000",
  bank_swift: "",
  invoice_note: "Pay by bank transfer using the invoice number as the reference. Your seat is confirmed once the transfer is received.",
  facebook_url: "https://www.facebook.com/hollywoodschool1",
  instagram_url: "https://www.instagram.com/hollywoodschool/",
};

const MOCK: Catalog = {
  categories: classCategories,
  courses: Object.values(mockCoursesByCategory).flat(),
  coursesByCategory: mockCoursesByCategory,
  summerPrograms: mockSummer,
  testimonials: mockTestimonials,
  mediaItems: mockMedia,
  programSummaries: mockProgramSummaries,
  settings: MOCK_SETTINGS,
};

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapCatalog(raw: any): Catalog {
  const categories: ClassCategory[] = (raw.categories ?? []).map((c: any) => ({
    id: c.id,
    title: c.title,
    age: c.age,
    description: c.description,
    about: c.about,
    highlights: c.highlights ?? [],
    image: resolveImage(c.image),
    href: `/classes/${c.id}`,
  }));

  const toCourse = (c: any): Course => ({
    id: c.id,
    title: c.title,
    level: c.level,
    duration: c.duration,
    schedule: c.schedule,
    description: c.description,
    instructor: c.instructor,
    price: Number(c.price),
    seats: c.seats,
    cap: c.cap,
  });

  const courses: Course[] = (raw.courses ?? []).map(toCourse);
  const coursesByCategory: Record<string, Course[]> = {};
  (raw.courses ?? []).forEach((c: any) => {
    (coursesByCategory[c.category_id] ??= []).push(toCourse(c));
  });

  const summerPrograms: SummerProgram[] = (raw.summerPrograms ?? []).map((s: any) => ({
    id: s.id,
    title: s.title,
    audience: s.audience,
    duration: s.duration,
    start: s.start,
    status: s.status,
    highlight: s.highlight,
    price: s.price != null ? Number(s.price) : undefined,
  }));

  const testimonials: Testimonial[] = (raw.testimonials ?? []).map((t: any) => ({
    id: t.id,
    name: t.name,
    initials: t.initials,
    role: t.role,
    quote: t.quote,
    rating: t.rating,
    category: t.category,
    featured: t.featured,
  }));

  const mediaItems: MediaItem[] = (raw.mediaItems ?? []).map((m: any) => ({
    id: m.id,
    title: m.title,
    category: m.category,
    video: m.video,
    image: resolveImage(m.image),
  }));

  // program summaries for the enroll page (one per course + a generic entry
  // for any category that has no courses)
  const catById = new Map<string, any>((raw.categories ?? []).map((c: any) => [c.id, c]));
  const programSummaries: ProgramSummary[] = [];
  for (const cat of raw.categories ?? []) {
    const list = (raw.courses ?? []).filter((c: any) => c.category_id === cat.id);
    if (list.length === 0) {
      programSummaries.push({
        value: cat.id,
        title: `${cat.title} Program`,
        categoryId: cat.id,
        categoryTitle: cat.title,
        age: cat.age,
        image: resolveImage(cat.image),
      });
    }
  }
  for (const c of raw.courses ?? []) {
    const cat = catById.get(c.category_id);
    programSummaries.push({
      value: c.id,
      title: c.title,
      categoryId: c.category_id,
      categoryTitle: cat?.title ?? c.category_id,
      age: cat?.age,
      level: c.level,
      duration: c.duration,
      schedule: c.schedule,
      instructor: c.instructor,
      price: Number(c.price),
      image: resolveImage(cat?.image),
    });
  }

  // summer programs are enrollable too (each with its own price)
  for (const sp of raw.summerPrograms ?? []) {
    programSummaries.push({
      value: sp.id,
      title: sp.title,
      categoryId: "summer",
      categoryTitle: "Summer Academy",
      age: sp.audience,
      duration: sp.duration,
      schedule: sp.start,
      price: sp.price != null ? Number(sp.price) : undefined,
      image: resolveImage("hero-stage"),
    });
  }

  const settings: Settings = { ...MOCK_SETTINGS, ...(raw.settings ?? {}) };

  return { categories, courses, coursesByCategory, summerPrograms, testimonials, mediaItems, programSummaries, settings };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Site catalog. Starts with mock data instantly (initialData), then swaps to
 *  live Supabase data once fetched. Falls back to mock if the backend is down. */
// Persist the last live catalog so a page reload shows the LATEST data
// instantly (no flash of the old/mock images while the fetch is in flight).
const CACHE_KEY = "hs-catalog-v1";
const readCache = (): Catalog | null => {
  try {
    const s = localStorage.getItem(CACHE_KEY);
    return s ? (JSON.parse(s) as Catalog) : null;
  } catch {
    return null;
  }
};

export function useCatalog(): Catalog {
  const { data } = useQuery({
    queryKey: ["catalog"],
    queryFn: async () => {
      const raw = await fetchCatalog();
      const cat = raw ? mapCatalog(raw) : MOCK;
      if (raw) {
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(cat)); } catch { /* ignore */ }
      }
      return cat;
    },
    // Show the last-known LIVE data instantly (cached), falling back to mock
    // only on the very first visit. Still refetches to pick up changes.
    placeholderData: () => readCache() ?? MOCK,
    staleTime: 5 * 60 * 1000,
  });
  return data ?? MOCK;
}
