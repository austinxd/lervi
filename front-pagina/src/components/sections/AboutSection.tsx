import ScrollReveal from "@/components/ScrollReveal";
import type { PropertyPhoto } from "@/lib/types";

interface AboutSectionProps {
  description: string;
  photos?: PropertyPhoto[];
  propertyName?: string;
  template?: string;
}

export default function AboutSection({ description, photos = [], propertyName, template }: AboutSectionProps) {
  if (template === "premium") {
    return (
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="section-subtitle">Bienvenido</p>
              <h2 className="section-title mb-4">Sobre Nosotros</h2>
              <div className="divider-gold mx-auto" />
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <ScrollReveal>
              <p className="text-gray-500 font-sans leading-[1.9] text-base sm:text-lg whitespace-pre-line">
                {description}
              </p>
            </ScrollReveal>

            {photos.length > 0 && (
              <ScrollReveal delay={150}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 rounded-[0.625rem] overflow-hidden">
                    <img
                      src={photos[0].image}
                      alt={photos[0].caption || propertyName || ""}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  {photos.slice(1, 3).map((photo) => (
                    <div key={photo.id} className="rounded-[0.625rem] overflow-hidden">
                      <img
                        src={photo.image}
                        alt={photo.caption || propertyName || ""}
                        className="w-full h-40 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      <div className="max-w-3xl mx-auto text-center">
        <p className="section-subtitle">Conozca</p>
        <h2 className="section-title mb-3">Sobre Nosotros</h2>
        <div className="divider-gold mx-auto mb-10" />
        <p className="text-gray-500 font-sans leading-[1.8] text-base sm:text-lg whitespace-pre-line">
          {description}
        </p>
      </div>
    </section>
  );
}
