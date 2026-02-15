import ScrollReveal from "@/components/ScrollReveal";
import type { PropertyPhoto } from "@/lib/types";

interface GallerySectionProps {
  photos: PropertyPhoto[];
  propertyName: string;
  template?: string;
}

export default function GallerySection({ photos, propertyName, template }: GallerySectionProps) {
  if (photos.length === 0) return null;

  const featured = photos[0];
  const rest = photos.slice(1);

  if (template === "premium") {
    return (
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="section-subtitle">Galeria</p>
              <h2 className="section-title mb-4">Nuestro Hotel</h2>
              <div className="w-16 h-0.5 bg-gradient-to-r from-accent-400 to-accent-600 mx-auto rounded-full" />
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Featured */}
            <ScrollReveal className="sm:col-span-2 lg:col-span-2 lg:row-span-2">
              <div className="relative rounded-xl overflow-hidden group h-full">
                <div className="aspect-[16/10] lg:aspect-auto lg:h-full min-h-[20rem]">
                  <img
                    src={featured.image}
                    alt={featured.caption || propertyName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {featured.caption && (
                    <div className="absolute inset-x-0 bottom-0 p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <p className="text-white text-sm font-sans font-medium">{featured.caption}</p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollReveal>

            {rest.map((photo, i) => (
              <ScrollReveal key={photo.id} delay={80 * (i + 1)}>
                <div className="relative rounded-xl overflow-hidden group">
                  <div className="aspect-[4/3]">
                    <img
                      src={photo.image}
                      alt={photo.caption || propertyName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    {photo.caption && (
                      <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <p className="text-white text-sm font-sans">{photo.caption}</p>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="section-subtitle">Galeria</p>
          <h2 className="section-title mb-3">Nuestro Hotel</h2>
          <div className="divider-gold mx-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="sm:col-span-2 lg:col-span-2 lg:row-span-2 relative overflow-hidden group card-luxury">
            <div className="aspect-[16/10] lg:aspect-auto lg:h-full">
              <img
                src={featured.image}
                alt={featured.caption || propertyName}
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {featured.caption && (
                <div className="absolute inset-x-0 bottom-0 p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <p className="text-white text-sm font-sans font-medium">{featured.caption}</p>
                </div>
              )}
            </div>
          </div>

          {rest.map((photo) => (
            <div key={photo.id} className="relative overflow-hidden group card-luxury">
              <div className="aspect-[4/3]">
                <img
                  src={photo.image}
                  alt={photo.caption || propertyName}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {photo.caption && (
                  <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <p className="text-white text-sm font-sans">{photo.caption}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
