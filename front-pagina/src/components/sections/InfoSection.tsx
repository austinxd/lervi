import type { Property } from "@/lib/types";

interface InfoSectionProps {
  property: Property;
}

export default function InfoSection({ property }: InfoSectionProps) {
  return (
    <section className="py-24 sm:py-32 border-t border-sand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="section-subtitle">Información</p>
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
              Ubicación
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
