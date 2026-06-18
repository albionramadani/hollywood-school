import { useCatalog } from "@/hooks/useCatalog";

const DEFAULTS = {
  about_us:
    "At Hollywood School, we are committed to developing the next generation of artists, performers, and storytellers in Kosovo and beyond. We believe acting is more than performance. It is a discipline that builds confidence, imagination, courage, self-awareness, and genuine human connection. Our programs welcome kids, teens, adults, and professional actors at every stage of their journey, from beginners discovering their voice to experienced performers sharpening and expanding their craft.",
  mission:
    "Our mission is to train artists to listen deeply, risk bravely, and create truthfully. We believe in discipline paired with imagination, where every class shapes confidence, awakens presence, honesty, and courage. Students leave our doors with tools to thrive as actors and as human beings: present, fearless, and connected.",
  vision:
    "A world where actors carry their artistry into every corner of life, using their craft to inspire connection, honesty, and transformation.",
  values: [
    "Courage in risk, because growth lives beyond comfort.",
    "Discipline in craft, because freedom is built on rigor.",
    "Presence in the moment, because listening creates truth.",
    "Collaboration in practice, because art is never made alone.",
    "Imagination in process, because possibility fuels creation.",
  ].join("\n"),
};

const AboutSection = () => {
  const { settings } = useCatalog();
  const aboutUs = settings.about_us || DEFAULTS.about_us;
  const mission = settings.mission || DEFAULTS.mission;
  const vision = settings.vision || DEFAULTS.vision;
  const values = (settings.values || DEFAULTS.values).split("\n").filter(Boolean);

  return (
    <section id="about" className="bg-dark-surface py-20 px-4">
      <div className="max-w-[84rem] mx-auto space-y-16">
        <div>
          <h2 className="font-body text-4xl md:text-5xl text-gold mb-6">About Us</h2>
          <p className="font-body text-muted-foreground leading-relaxed text-base md:text-lg max-w-4xl">{aboutUs}</p>
        </div>

        <div>
          <h2 className="font-body text-3xl md:text-4xl text-gold mb-4">Mission Statement</h2>
          <p className="font-body text-muted-foreground leading-relaxed text-base md:text-lg max-w-4xl">{mission}</p>
        </div>

        <div>
          <h2 className="font-body text-3xl md:text-4xl text-gold mb-4">Vision</h2>
          <p className="font-body text-muted-foreground leading-relaxed text-base md:text-lg max-w-4xl">{vision}</p>
        </div>

        <div>
          <h2 className="font-body text-3xl md:text-4xl text-gold mb-4">Values</h2>
          <div className="font-body text-muted-foreground leading-relaxed text-base md:text-lg space-y-1">
            {values.map((line, i) => {
              const sp = line.indexOf(" ");
              const head = sp > 0 ? line.slice(0, sp) : line;
              const rest = sp > 0 ? line.slice(sp) : "";
              return (
                <p key={i}>
                  <span className="text-foreground font-bold">{head}</span>
                  {rest}
                </p>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
