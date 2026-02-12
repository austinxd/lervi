import Link from "next/link";

interface HeroEssentialProps {
  hotelName: string;
  city: string;
  tagline?: string;
  heroImage?: string | null;
  stars?: number | null;
}

export default function HeroEssential({
  hotelName,
  city,
  tagline,
  heroImage,
  stars,
}: HeroEssentialProps) {
  return (
    <section className="relative min-h-[50vh] md:min-h-[70vh] flex items-center">
      {/* Background */}
      {heroImage ? (
        <>
          <div className="absolute inset-0">
            <img src={heroImage} alt={hotelName} className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-900 to-primary-800" />
      )}

      {/* Content */}
      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        {/* Stars badge */}
        {stars && stars > 0 && (
          <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
            <div className="flex gap-0.5">
              {Array.from({ length: stars }).map((_, i) => (
                <svg key={i} className="w-3.5 h-3.5 text-accent-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <span className="text-white/80 text-xs font-medium tracking-wide">{city}</span>
          </div>
        )}

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-[1.1] mb-5 tracking-tight">
          {hotelName}
        </h1>

        {tagline && (
          <p className="text-lg sm:text-xl text-white/70 font-light mb-10 max-w-lg mx-auto">
            {tagline}
          </p>
        )}

        {!tagline && <div className="mb-10" />}

        <Link href="/disponibilidad" className="btn-primary !px-10 !py-3.5">
          Reservar Ahora
        </Link>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-sand-50 to-transparent" />
    </section>
  );
}
