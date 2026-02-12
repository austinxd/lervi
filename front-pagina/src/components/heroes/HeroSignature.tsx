import Link from "next/link";
import type { PropertyPhoto } from "@/lib/types";

interface HeroSignatureProps {
  hotelName: string;
  city: string;
  tagline?: string;
  heroImage?: string | null;
  stars?: number | null;
  photos?: PropertyPhoto[];
}

export default function HeroSignature({
  hotelName,
  city,
  tagline,
  heroImage,
  stars,
  photos = [],
}: HeroSignatureProps) {
  const slideImages = photos.length > 0
    ? photos.slice(0, 5).map((p) => p.image)
    : heroImage
      ? [heroImage]
      : [];

  return (
    <section className="relative min-h-[60vh] md:min-h-[85vh] flex items-center bg-primary-900 overflow-hidden">
      {/* Background: slider or single image */}
      {slideImages.length > 1 ? (
        <div className="absolute inset-0 hero-signature-slides">
          {slideImages.map((src, i) => (
            <div
              key={i}
              className="absolute inset-0 hero-signature-slide"
              style={{ animationDelay: `${i * 6}s` }}
            >
              <img src={src} alt={`${hotelName} ${i + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        </div>
      ) : slideImages.length === 1 ? (
        <>
          <div className="absolute inset-0">
            <img src={slideImages[0]} alt={hotelName} className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900" />
      )}

      {/* Content — left aligned */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-2xl">
          {/* Label */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-px bg-accent-500" />
            <span className="text-accent-400 text-xs uppercase tracking-[0.25em] font-medium">
              Bienvenido
            </span>
          </div>

          {/* Stars */}
          {stars && stars > 0 && (
            <div className="flex items-center gap-1 mb-5">
              {Array.from({ length: stars }).map((_, i) => (
                <svg key={i} className="w-4 h-4 text-accent-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
          )}

          {/* Hotel name */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif text-white leading-[1.05] mb-6">
            {hotelName}
          </h1>

          {/* Tagline + city */}
          <p className="text-xl text-white/60 font-light mb-2 font-sans">
            {tagline || city}
          </p>
          {tagline && (
            <p className="text-sm text-white/35 font-sans tracking-wide mb-12">
              {city}
            </p>
          )}
          {!tagline && <div className="mb-12" />}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/disponibilidad" className="btn-primary !py-4 !px-10">
              Reservar Estadía
            </Link>
            <Link href="/habitaciones" className="btn-outline !py-4 !px-10">
              Ver Habitaciones
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative side element */}
      <div className="hidden lg:flex absolute right-10 top-1/2 -translate-y-1/2 flex-col items-center gap-3">
        <div className="w-px h-16 bg-white/20" />
        <div className="w-2 h-2 rounded-full border border-white/30" />
        <div className="w-px h-16 bg-white/20" />
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-sand-50 to-transparent" />
    </section>
  );
}
