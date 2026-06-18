import heroImage from "@/assets/hero-stage.jpg";
import { useCatalog } from "@/hooks/useCatalog";

const HeroSection = () => {
  const { settings } = useCatalog();
  const line1 = settings.hero_line1 || "Where Your Imagination";
  const line2 = settings.hero_line2 || "Becomes a Reality!";

  return (
    <section className="relative w-full h-screen min-h-[600px] overflow-hidden">
      <img
        src={heroImage}
        alt="Child on stage under spotlight"
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 pt-16">
        <h1
          className="font-display text-foreground text-center"
          style={{ fontSize: "66px", fontWeight: 500, lineHeight: "101%", letterSpacing: "0.07em" }}
        >
          {line1}
        </h1>
        <p
          className="font-display text-foreground text-center"
          style={{ fontSize: "66px", fontWeight: 500, lineHeight: "101%", letterSpacing: "0.07em" }}
        >
          {line2}
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
