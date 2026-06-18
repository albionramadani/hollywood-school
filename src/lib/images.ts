// Maps the image keys stored in the DB to the bundled asset URLs.
import kids from "@/assets/class-kids.jpg";
import teens from "@/assets/class-teens.jpg";
import adults from "@/assets/class-adults.jpg";
import stage from "@/assets/hero-stage.jpg";

const MAP: Record<string, string> = {
  "class-kids": kids,
  "class-teens": teens,
  "class-adults": adults,
  "hero-stage": stage,
};

export const resolveImage = (key?: string | null): string => {
  if (!key) return stage;
  if (key.startsWith("http") || key.startsWith("/") || key.startsWith("data:")) return key; // uploaded URL
  return MAP[key] || stage;
};
