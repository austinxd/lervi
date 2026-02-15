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
    <section className="relative h-[70vh] sm:h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={bgImage}
          alt={propertyName}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Darkening overlays */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Vignette gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40" />

      {/* Content */}
      <ScrollReveal className="relative z-10 text-center px-4">
        {/* Top vertical line */}
        <div className="w-px h-12 bg-accent-500/40 mx-auto mb-8" />

        <p className="text-white/40 text-[0.6rem] uppercase tracking-[0.4em] font-sans font-light mb-6">
          La Experiencia
        </p>

        <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extralight text-white leading-[0.95] tracking-[-0.02em] max-w-3xl mx-auto">
          Donde cada detalle<br className="hidden sm:block" /> cuenta
        </h2>

        {/* Bottom vertical line */}
        <div className="w-px h-12 bg-accent-500/40 mx-auto mt-8" />
      </ScrollReveal>
    </section>
  );
}
