import ScrollReveal from "@/components/ScrollReveal";
import type { PropertySummary } from "@/lib/types";

interface InfoSectionProps {
  property: PropertySummary;
  template?: string;
}

export default function InfoSection({ property, template }: InfoSectionProps) {
  if (template === "premium") {
    return (
      <section className="py-24 sm:py-32 border-t border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Editorial heading */}
          <ScrollReveal>
            <div className="flex items-start gap-6 mb-16">
              <span className="text-7xl font-serif font-extralight text-accent-500/20 leading-none hidden sm:block">
                05
              </span>
              <div>
                <div className="w-8 h-px bg-accent-500/40 mb-4" />
                <p className="text-accent-500/80 text-[0.6rem] uppercase tracking-[0.35em] font-sans font-light mb-3">
                  Informacion
                </p>
                <h2 className="section-title">Datos del Hotel</h2>
              </div>
            </div>
          </ScrollReveal>

          {/* Horizontal row with dividers (desktop) / vertical stack (mobile) */}
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:divide-x divide-y md:divide-y-0 divide-accent-500/20">
              {/* Check-in */}
              <div className="flex-1 text-center py-8 md:py-0 md:px-10 group">
                <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-white/[0.06] flex items-center justify-center group-hover:bg-white/[0.1] transition-colors duration-300">
                  <svg
                    className="w-7 h-7 text-accent-500/80"
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
              <div className="flex-1 text-center py-8 md:py-0 md:px-10 group">
                <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-white/[0.06] flex items-center justify-center group-hover:bg-white/[0.1] transition-colors duration-300">
                  <svg
                    className="w-7 h-7 text-accent-500/80"
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
              <div className="flex-1 text-center py-8 md:py-0 md:px-10 group">
                <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-white/[0.06] flex items-center justify-center group-hover:bg-white/[0.1] transition-colors duration-300">
                  <svg
                    className="w-7 h-7 text-accent-500/80"
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
          </ScrollReveal>
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
