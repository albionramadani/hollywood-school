// =====================================================================
// Hollywood School — home page mock data
// Temporary "mock" content for the Classes + Summer Academy sections.
// Later this is replaced by data managed from the admin dashboard.
// =====================================================================
import kidsImage from "@/assets/class-kids.jpg";
import teensImage from "@/assets/class-teens.jpg";
import adultsImage from "@/assets/class-adults.jpg";
import stageImage from "@/assets/hero-stage.jpg";

/** External enrollment form (shared with the hero CTA). */
export const ENROLL_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdAsLfEE_YXoTFgN21oXP99HlGYeOhQqy8SSQOARnAcf9HtNQ/viewform";

// ---------- Classes: programs for every age ----------
export interface ClassCategory {
  id: string;
  title: string;
  age: string;
  description: string;
  /** Longer intro shown on the category page. */
  about: string;
  /** Bullet highlights of what the program offers. */
  highlights: string[];
  image: string;
  href: string;
}

export const classCategories: ClassCategory[] = [
  {
    id: "kids",
    title: "Kids",
    age: "Ages 6 – 12",
    description:
      "Playful, confidence-building foundations — imagination, voice, and first steps on stage.",
    about:
      "Our Kids program is a joyful first step on stage. Through games, storytelling, and playful exercises, young performers build confidence, focus, and a love of performing — at their own pace, in a warm and supportive environment.",
    highlights: [
      "Confidence and stage presence",
      "Voice, diction, and clear speech",
      "Imagination and creative play",
      "A term-end performance for family",
    ],
    image: kidsImage,
    href: "/classes/kids",
  },
  {
    id: "teens",
    title: "Teens",
    age: "Ages 13 – 17",
    description:
      "Screen acting, improv, and theatre performance that turn instinct into real technique.",
    about:
      "The Teens program turns raw instinct into real technique. Students train across screen acting, improvisation, and theatre — building the craft and confidence to perform, and to audition, with genuine presence.",
    highlights: [
      "On-camera and scene-study technique",
      "Improv and ensemble work",
      "Audition and self-tape skills",
      "Live theatre performance experience",
    ],
    image: teensImage,
    href: "/classes/teens",
  },
  {
    id: "young-adults",
    title: "Young Adults",
    age: "Ages 18 – 24",
    description:
      "Build a craft and a career — conservatory-level training for the working actor.",
    about:
      "Conservatory-level training for the committed young actor. Build a craft, a reel, and a career through rigorous scene study, on-camera work, and real industry preparation.",
    highlights: [
      "Conservatory-level craft and technique",
      "A professional demo reel",
      "Advanced scene study",
      "Career and industry preparation",
    ],
    image: adultsImage,
    href: "/classes/young-adults",
  },
  {
    id: "professional",
    title: "Professional Track",
    age: "Advanced",
    description:
      "Intensive masterclasses for working and professional actors sharpening their edge.",
    about:
      "Intensive masterclasses for working and professional actors. Sharpen your edge with advanced coaching in audition technique, on-set craft, and sustaining truthful performance under real conditions.",
    highlights: [
      "Masterclass-level coaching",
      "Audition and self-tape mastery",
      "On-set film technique",
      "Sustaining truth across long shoots",
    ],
    image: stageImage,
    href: "/classes/professional",
  },
];

// ---------- Courses per category ----------
export interface Course {
  id: string;
  title: string;
  level: string;
  duration: string;
  schedule: string;
  description: string;
  instructor: string;
  price: number;
  seats: number;
  cap: number;
}

export const coursesByCategory: Record<string, Course[]> = {
  teens: [
    { id: "teens-scene", title: "On-Camera Scene Study", level: "Intermediate", duration: "12 weeks", schedule: "Tue · 5–7pm", instructor: "Dahlia Voss", price: 1450, seats: 6, cap: 14, description: "Build a screen-ready scene from cold read to final take, with weekly playback." },
    { id: "teens-screen", title: "Screen Acting", level: "Beginner", duration: "10 weeks", schedule: "Thu · 5–7pm", instructor: "Leo Fontaine", price: 1180, seats: 9, cap: 14, description: "The fundamentals of truthful, camera-aware performance for the new screen actor." },
    { id: "teens-improv", title: "Improvisation", level: "All levels", duration: "8 weeks", schedule: "Mon · 6–8pm", instructor: "Nadia Cruz", price: 940, seats: 11, cap: 16, description: "Think fast, fail joyfully, and unlock the spontaneity directors love." },
    { id: "teens-theatre", title: "Theatre Performance", level: "Intermediate", duration: "12 weeks", schedule: "Sat · 2–5pm", instructor: "Marcus Bell", price: 1320, seats: 4, cap: 18, description: "A full stage production — text, blocking, and a live performance for an audience." },
  ],
  "young-adults": [
    { id: "ya-foundations", title: "Conservatory Foundations", level: "Beginner", duration: "14 weeks", schedule: "Mon/Wed · 6–9pm", instructor: "Eleanor Frost", price: 2200, seats: 7, cap: 16, description: "A rigorous grounding in technique, text, and presence for the serious beginner." },
    { id: "ya-scenelab", title: "Advanced Scene Study Lab", level: "Advanced", duration: "12 weeks", schedule: "Tue · 6:30–9:30pm", instructor: "Eleanor Frost", price: 1980, seats: 2, cap: 12, description: "Demanding partner work on contemporary film scenes, critiqued frame by frame." },
    { id: "ya-reel", title: "Reel Production Intensive", level: "Intermediate", duration: "6 weeks", schedule: "Sat · 10am–2pm", instructor: "Leo Fontaine", price: 1750, seats: 5, cap: 10, description: "Write, shoot, and edit two professional scenes — leave with a finished demo reel." },
    { id: "ya-voice", title: "Voice for Camera", level: "All levels", duration: "8 weeks", schedule: "Thu · 6–8pm", instructor: "Marcus Bell", price: 1280, seats: 8, cap: 14, description: "Microphone technique, accent work, and ADR for the working voice actor." },
  ],
  professional: [
    { id: "pro-advanced", title: "Advanced Screen Acting", level: "Professional", duration: "10 weeks", schedule: "Wed · 7–10pm", instructor: "Eleanor Frost", price: 2650, seats: 3, cap: 10, description: "For represented actors — sustaining truth across coverage, takes, and long days." },
    { id: "pro-audition", title: "Audition Mastery", level: "Professional", duration: "6 weeks", schedule: "Mon · 7–9:30pm", instructor: "Dahlia Voss", price: 1850, seats: 4, cap: 12, description: "Self-tape strategy, room craft, and choices that book the job." },
    { id: "pro-film", title: "Film Acting Intensive", level: "Professional", duration: "4 weeks", schedule: "Sat/Sun · 10am–4pm", instructor: "Leo Fontaine", price: 3200, seats: 1, cap: 8, description: "A masterclass on a real set with a working director." },
  ],
};

// ---------- Program summaries (used by the enroll page) ----------
export interface ProgramSummary {
  value: string;
  title: string;
  categoryId: string;
  categoryTitle: string;
  age: string;
  level?: string;
  duration?: string;
  schedule?: string;
  instructor?: string;
  price?: number;
  image: string;
}

export const programSummaries: ProgramSummary[] = (() => {
  const byId = (id: string) => classCategories.find((c) => c.id === id);
  const out: ProgramSummary[] = [];

  const kids = byId("kids");
  if (kids) {
    out.push({
      value: "kids",
      title: `${kids.title} Program`,
      categoryId: "kids",
      categoryTitle: kids.title,
      age: kids.age,
      image: kids.image,
    });
  }

  for (const [catId, list] of Object.entries(coursesByCategory)) {
    const cat = byId(catId);
    if (!cat) continue;
    for (const c of list) {
      out.push({
        value: c.id,
        title: c.title,
        categoryId: catId,
        categoryTitle: cat.title,
        age: cat.age,
        level: c.level,
        duration: c.duration,
        schedule: c.schedule,
        instructor: c.instructor,
        price: c.price,
        image: cat.image,
      });
    }
  }
  return out;
})();

export const getProgram = (value?: string | null): ProgramSummary =>
  programSummaries.find((p) => p.value === value) ?? programSummaries[0];

/** Resolve the program a "register" link points to, from ?c= / ?cat= params. */
export const resolveProgramValue = (c?: string | null, cat?: string | null): string => {
  if (c && programSummaries.some((p) => p.value === c)) return c;
  if (cat === "kids") return "kids";
  if (cat && coursesByCategory[cat]?.length) return coursesByCategory[cat][0].id;
  return programSummaries[0].value;
};

// ---------- Summer Academy ----------
export interface SummerProgram {
  id: string;
  title: string;
  audience: string;
  duration: string;
  start: string;
  status: string;
  highlight: boolean;
  price?: number;
}

export const summerAcademy = {
  year: 2026,
  capacity: 60,
  /** Countdown target — first cohort start. */
  deadline: "2026-06-22T09:00:00",
};

export const summerPrograms: SummerProgram[] = [
  { id: "screen-intensive", title: "Screen Intensive", audience: "Teens", duration: "4 weeks", start: "Jul 6", status: "12 Seats", highlight: true },
  { id: "young-stars", title: "Young Stars Camp", audience: "Kids", duration: "2 weeks", start: "Jun 22", status: "Filling Fast", highlight: true },
  { id: "conservatory-lab", title: "Conservatory Lab", audience: "Young Adults", duration: "4 weeks", start: "Jul 6", status: "Waitlist", highlight: false },
  { id: "audition-bootcamp", title: "Audition Bootcamp", audience: "All ages", duration: "1 week", start: "Aug 3", status: "Open", highlight: true },
];

// ---------- Testimonials ----------
export type TestimonialCategory = "student" | "parent" | "success";

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  initials: string;
  rating?: number;
  category?: TestimonialCategory;
  featured?: boolean;
}

export const testimonials: Testimonial[] = [
  { id: "maya-r", name: "Maya R.", initials: "MR", role: "Parent · Teens Program", category: "parent", rating: 5, featured: true,
    quote: "My daughter walked in shy and walked out booking her first national commercial. Hollywood School changed her life." },
  { id: "daniel-o", name: "Daniel O.", initials: "DO", role: "Alum · Now represented", category: "success", rating: 5, featured: true,
    quote: "The conservatory year rebuilt my craft from the ground up. Within months of graduating I signed with an agent and booked a series regular." },
  { id: "priya-s", name: "Priya S.", initials: "PS", role: "Young Adult Student", category: "student", rating: 5, featured: true,
    quote: "I came for a reel and left with a technique I trust under any pressure. The on-camera playback every week changed everything." },
  { id: "carla-m", name: "Carla M.", initials: "CM", role: "Parent", category: "parent", rating: 5,
    quote: "The most professional youth program we found. My son's confidence is unrecognizable." },
  { id: "theo-b", name: "Theo B.", initials: "TB", role: "Teen Student", category: "student", rating: 5,
    quote: "Improv class made me brave. I auditioned for my school play and got the lead." },
  { id: "jasmine-w", name: "Jasmine W.", initials: "JW", role: "Alum · Booked a series", category: "success", rating: 5,
    quote: "Audition Mastery taught me how to walk into the room and own it. It books jobs." },
  { id: "greg-p", name: "Greg P.", initials: "GP", role: "Parent", category: "parent", rating: 5,
    quote: "Small classes, real directors, zero ego. Worth every cent." },
  { id: "lina-k", name: "Lina K.", initials: "LK", role: "Young Adult", category: "student", rating: 4,
    quote: "The reel I built here got me my first three auditions. The faculty genuinely care." },
  { id: "marcus-d", name: "Marcus D.", initials: "MD", role: "Alum · Stage debut", category: "success", rating: 5,
    quote: "From hobbyist to working actor in eighteen months. The conservatory is the real deal." },
];

// ---------- Media gallery ----------
export type MediaCategory = "photos" | "videos" | "performances" | "bts";

export interface MediaItem {
  id: string;
  title: string;
  category: MediaCategory;
  video?: boolean;
  image: string;
}

export const MEDIA_CATEGORY_LABEL: Record<MediaCategory, string> = {
  photos: "Photo",
  videos: "Video",
  performances: "Student Performance",
  bts: "Behind The Scenes",
};

export const mediaItems: MediaItem[] = [
  { id: "m1", title: "Spring Showcase — Final Scene", category: "performances", video: true, image: stageImage },
  { id: "m2", title: "On the studio floor", category: "photos", image: kidsImage },
  { id: "m3", title: "Lighting the set", category: "bts", image: stageImage },
  { id: "m4", title: "Monologue night", category: "performances", video: true, image: teensImage },
  { id: "m5", title: "Scene study in session", category: "photos", image: adultsImage },
  { id: "m6", title: "Rehearsal, take twelve", category: "bts", image: teensImage },
  { id: "m7", title: "Self-tape masterclass", category: "videos", video: true, image: stageImage },
  { id: "m8", title: "Curtain call", category: "photos", image: kidsImage },
  { id: "m9", title: "On-camera intensive reel", category: "videos", video: true, image: adultsImage },
  { id: "m10", title: "Teen ensemble, Act II", category: "performances", image: teensImage },
  { id: "m11", title: "Director's notes", category: "bts", image: adultsImage },
  { id: "m12", title: "Conservatory cohort", category: "photos", image: stageImage },
];
