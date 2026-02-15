import ScrollReveal from "@/components/ScrollReveal";

interface AmenitiesSectionProps {
  amenities: string[];
  template?: string;
}

const AMENITY_ICONS: Record<string, string> = {
  wifi: "M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z",
  piscina: "M3.75 13.5h16.5M3.75 17.25h16.5M12 3v3m-4.5 3h9a1.5 1.5 0 011.5 1.5v0a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 016 10.5v0A1.5 1.5 0 017.5 9z",
  estacionamiento: "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12",
};

function getIconPath(amenity: string): string {
  const lower = amenity.toLowerCase();
  for (const [key, path] of Object.entries(AMENITY_ICONS)) {
    if (lower.includes(key)) return path;
  }
  return "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z";
}

export default function AmenitiesSection({ amenities, template }: AmenitiesSectionProps) {
  if (amenities.length === 0) return null;

  if (template === "premium") {
    return (
      <section className="section-alt-bg py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="section-subtitle">Servicios</p>
              <h2 className="section-title mb-4">Servicios del Hotel</h2>
              <div className="divider-gold mx-auto" />
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {amenities.map((amenity, i) => (
              <ScrollReveal key={amenity} delay={60 * i}>
                <div className="group amenity-card p-6 text-center transition-all duration-300 hover:-translate-y-0.5 rounded-[0.625rem] border border-[#eee]">
                  <div className="w-11 h-11 mx-auto mb-4 rounded-full bg-accent-50 flex items-center justify-center group-hover:bg-accent-100 transition-colors duration-300">
                    <svg
                      className="w-5 h-5 text-accent-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d={getIconPath(amenity)}
                      />
                    </svg>
                  </div>
                  <p className="text-[0.8rem] font-sans text-primary-800 font-medium leading-snug">
                    {amenity}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-alt-bg py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="section-subtitle">Servicios</p>
          <h2 className="section-title mb-3">Servicios del Hotel</h2>
          <div className="divider-gold mx-auto" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {amenities.map((amenity) => (
            <div
              key={amenity}
              className="group amenity-card p-6 text-center transition-all duration-300 hover:-translate-y-0.5 card-luxury"
            >
              <div className="w-11 h-11 mx-auto mb-4 rounded-full bg-accent-50 flex items-center justify-center group-hover:bg-accent-100 transition-colors duration-300">
                <svg
                  className="w-5 h-5 text-accent-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d={getIconPath(amenity)}
                  />
                </svg>
              </div>
              <p className="text-[0.8rem] font-sans text-primary-800 font-medium leading-snug">
                {amenity}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
