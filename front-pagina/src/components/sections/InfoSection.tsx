import ScrollReveal from "@/components/ScrollReveal";
import type { PropertySummary } from "@/lib/types";

interface InfoSectionProps {
  property: PropertySummary;
  template?: string;
}

export default function InfoSection({ property, template }: InfoSectionProps) {
  if (template === "premium") {
    return (
      <section className="section-alt-bg py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="section-subtitle">Contacto</p>
              <h2 className="section-title mb-4">Nuestros Datos</h2>
              <div className="divider-gold mx-auto" />
            </div>
          </ScrollReveal>

          {/* Diamant dec-frame */}
          <div className="dec-frame">
            <ScrollReveal delay={100}>
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                {/* Location */}
                <div className="text-center pb-8 md:pb-0 md:px-8 first:md:pl-0 last:md:pr-0">
                  <div className="w-14 h-14 mx-auto mb-5 rounded-full border border-accent-500/20 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-accent-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-serif text-lg text-primary-900 mb-2">
                    Ubicación
                  </h3>
                  <p className="text-gray-500 font-sans text-sm leading-relaxed uppercase tracking-wide">
                    {property.address}
                    {property.city && <><br />{property.city}</>}
                  </p>
                </div>

                {/* Check-in / Check-out */}
                <div className="text-center py-8 md:py-0 md:px-8">
                  <div className="w-14 h-14 mx-auto mb-5 rounded-full border border-accent-500/20 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-accent-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-serif text-lg text-primary-900 mb-2">
                    Horarios
                  </h3>
                  <p className="text-gray-500 font-sans text-sm leading-relaxed uppercase tracking-wide">
                    Check-in: {property.check_in_time || "14:00"}
                    <br />
                    Check-out: {property.check_out_time || "12:00"}
                  </p>
                </div>

                {/* Contact */}
                <div className="text-center pt-8 md:pt-0 md:px-8 first:md:pl-0 last:md:pr-0">
                  <div className="w-14 h-14 mx-auto mb-5 rounded-full border border-accent-500/20 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-accent-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                      />
                    </svg>
                  </div>
                  <h3 className="font-serif text-lg text-primary-900 mb-2">
                    Contacto
                  </h3>
                  <p className="text-gray-500 font-sans text-sm leading-relaxed uppercase tracking-wide">
                    {property.contact_email || property.contact_phone || "Consulte recepción"}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 sm:py-32 border-t border-sand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="section-subtitle">Informacion</p>
          <h2 className="section-title mb-3">Datos del Hotel</h2>
          <div className="divider-gold mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-16">
          {/* Check-in */}
          <div className="text-center group">
            <div className="w-14 h-14 mx-auto mb-5 rounded-full info-icon-bg flex items-center justify-center group-hover:info-icon-bg-hover transition-colors duration-300">
              <svg
                className="w-6 h-6 text-accent-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-serif text-lg text-primary-900 mb-1.5">
              Check-in
            </h3>
            <p className="text-gray-500 font-sans text-sm">
              {property.check_in_time || "14:00"}
            </p>
          </div>

          {/* Check-out */}
          <div className="text-center group">
            <div className="w-14 h-14 mx-auto mb-5 rounded-full info-icon-bg flex items-center justify-center group-hover:info-icon-bg-hover transition-colors duration-300">
              <svg
                className="w-6 h-6 text-accent-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-serif text-lg text-primary-900 mb-1.5">
              Check-out
            </h3>
            <p className="text-gray-500 font-sans text-sm">
              {property.check_out_time || "12:00"}
            </p>
          </div>

          {/* Location */}
          <div className="text-center group">
            <div className="w-14 h-14 mx-auto mb-5 rounded-full info-icon-bg flex items-center justify-center group-hover:info-icon-bg-hover transition-colors duration-300">
              <svg
                className="w-6 h-6 text-accent-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                />
              </svg>
            </div>
            <h3 className="font-serif text-lg text-primary-900 mb-1.5">
              Ubicacion
            </h3>
            <p className="text-gray-500 font-sans text-sm leading-relaxed">
              {property.address}
              {property.city && <>, {property.city}</>}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
