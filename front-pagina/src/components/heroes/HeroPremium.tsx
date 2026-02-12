import Link from "next/link";
import type { PropertyPhoto } from "@/lib/types";

interface HeroPremiumProps {
  hotelName: string;
  city: string;
  tagline?: string;
  heroImage?: string | null;
  photos?: PropertyPhoto[];
}

export default function HeroPremium({
  hotelName,
  city,
  tagline,
  heroImage,
  photos = [],
}: HeroPremiumProps) {
  return (
    <section className="relative h-screen flex items-center justify-center bg-black overflow-hidden">
      {/* Full-bleed background image */}
      {heroImage ? (
        <>
          <div className="absolute inset-0">
            <img
              src={heroImage}
              alt={hotelName}
              className="w-full h-full object-cover scale-105"
              style={{ animation: "premiumZoom 20s ease-out forwards" }}
            />
          </div>
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900 via-primary-800 to-black" />
      )}

      {/* Centered content — ultra minimal */}
      <div className="relative z-10 text-center px-4 sm:px-6">
        {/* Thin decorative line */}
        <div className="w-px h-16 bg-white/20 mx-auto mb-10" style={{ animation: "premiumFadeDown 1.2s ease-out 0.3s both" }} />

        {/* City */}
        <p
          className="text-white/40 text-[0.6rem] sm:text-[0.7rem] uppercase tracking-[0.4em] font-sans font-light mb-8"
          style={{ animation: "premiumFadeUp 1s ease-out 0.5s both" }}
        >
          {city}
        </p>

        {/* Hotel name — massive, light weight */}
        <h1
          className="text-5xl sm:text-7xl md:text-8xl lg:text-[8.5rem] xl:text-[10rem] font-serif font-extralight text-white leading-[0.9] mb-8 tracking-[-0.02em]"
          style={{ animation: "premiumFadeUp 1.2s ease-out 0.7s both" }}
        >
          {hotelName}
        </h1>

        {/* Tagline if exists */}
        {tagline && (
          <p
            className="text-white/35 text-sm sm:text-base font-sans font-light tracking-wide mb-12 max-w-md mx-auto"
            style={{ animation: "premiumFadeUp 1s ease-out 0.9s both" }}
          >
            {tagline}
          </p>
        )}

        {!tagline && <div className="mb-12" />}

        {/* CTA — ghost button */}
        <div style={{ animation: "premiumFadeUp 1s ease-out 1.1s both" }}>
          <Link
            href="/disponibilidad"
            className="inline-flex items-center justify-center border border-white/25 text-white/80 px-14 py-4 font-sans text-[0.6rem] sm:text-[0.65rem] font-medium uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-700"
          >
            Reservar Estancia
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3" style={{ animation: "premiumFadeUp 1s ease-out 1.5s both" }}>
        <span className="text-white/25 text-[0.55rem] uppercase tracking-[0.3em] font-sans">Explorar</span>
        <div className="w-px h-8 bg-white/20 relative overflow-hidden">
          <div className="w-full h-full bg-white/60 animate-scrollLine" />
        </div>
      </div>

      {/* Gallery preview strip — bottom */}
      {photos.length > 0 && (
        <div className="absolute bottom-0 right-0 hidden lg:flex items-end gap-1 p-6">
          {photos.slice(0, 3).map((photo, i) => (
            <div
              key={photo.id}
              className="w-16 h-20 overflow-hidden opacity-40 hover:opacity-80 transition-opacity duration-500"
            >
              <img
                src={photo.image}
                alt={photo.caption || `${hotelName} ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
