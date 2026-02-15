import ScrollReveal from "@/components/ScrollReveal";
import type { PropertyPhoto } from "@/lib/types";

interface ExperienceSectionProps {
  photos: PropertyPhoto[];
  propertyName: string;
}

export default function ExperienceSection({ photos, propertyName }: ExperienceSectionProps) {
  const bgImage = photos[0]?.image;
  if (!bgImage) return null;

  return (
    <section className="relative h-[60vh] sm:h-[70vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={bgImage} alt={propertyName} className="w-full h-full object-cover" />
      </div>

      {/* Warm gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(45deg, rgba(39,37,53,0.8) 0%, rgba(39,37,53,0.5) 50%, rgba(196,166,118,0.25) 100%)",
        }}
      />

      <ScrollReveal className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <p className="text-accent-300/80 text-xs sm:text-sm uppercase tracking-[0.25em] font-sans font-medium mb-4">
          La Experiencia
        </p>
        <div className="w-12 h-0.5 bg-gradient-to-r from-accent-400 to-accent-600 mx-auto mb-6 rounded-full" />
        <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-normal text-white leading-tight">
          Donde cada detalle cuenta
        </h2>
      </ScrollReveal>
    </section>
  );
}
