"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PropertyPhoto } from "@/lib/types";

interface HeroPremiumProps {
  hotelName: string;
  city: string;
  tagline?: string;
  heroImage?: string | null;
  photos?: PropertyPhoto[];
  stars?: number | null;
}

export default function HeroPremium({
  hotelName,
  city,
  tagline,
  heroImage,
  photos = [],
  stars,
}: HeroPremiumProps) {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches || window.innerWidth < 1024) return;

    const handleScroll = () => setOffsetY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section data-premium-hero className="relative h-screen flex items-center justify-center overflow-hidden -mt-20">
      {/* Background image with parallax */}
      {heroImage ? (
        <div
          className="absolute inset-0"
          style={{ transform: `translateY(${offsetY * 0.25}px)` }}
        >
          <img
            src={heroImage}
            alt={hotelName}
            className="w-full h-full object-cover scale-110"
          />
        </div>
      ) : null}

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: heroImage
            ? "linear-gradient(45deg, rgba(39,37,53,0.85) 0%, rgba(39,37,53,0.5) 40%, rgba(196,166,118,0.3) 100%)"
            : "linear-gradient(45deg, #272535 0%, #1e1c2a 50%, rgb(var(--color-accent-700-rgb)) 100%)",
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#272535]/60 via-transparent to-[#272535]/30" />

      {/* Content — NO animations, always visible */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
        {stars && stars > 0 && (
          <div className="flex items-center justify-center gap-1 mb-6">
            {Array.from({ length: stars }).map((_, i) => (
              <svg key={i} className="w-4 h-4 text-accent-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        )}

        <p className="text-accent-300/80 text-xs sm:text-sm uppercase tracking-[0.25em] font-sans font-medium mb-4">
          {city}
        </p>

        <div className="w-16 h-0.5 bg-gradient-to-r from-accent-400 to-accent-600 mx-auto mb-6 rounded-full" />

        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-normal text-white leading-[0.95] mb-6">
          {hotelName}
        </h1>

        {tagline && (
          <p className="text-white/60 text-base sm:text-lg font-sans font-light tracking-wide mb-10 max-w-xl mx-auto leading-relaxed">
            {tagline}
          </p>
        )}

        {!tagline && <div className="mb-10" />}

        {/* CTA — dark button, NOT using btn-primary to avoid gold override */}
        <Link
          href="/disponibilidad"
          style={{ background: "#32373c" }}
          className="inline-flex items-center justify-center text-white rounded-full px-10 py-4 font-sans text-sm font-medium uppercase tracking-[0.15em] hover:opacity-90 transition-opacity duration-300"
        >
          Reservar Ahora
        </Link>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
        <span className="text-white/40 text-[0.65rem] uppercase tracking-[0.2em] font-sans font-medium">
          Explorar
        </span>
        <div className="w-px h-8 bg-white/20 relative overflow-hidden rounded-full">
          <div className="w-full h-full bg-accent-400/80 animate-scrollLine" />
        </div>
      </div>

      {/* Photo thumbnails */}
      {photos.length > 0 && (
        <div className="absolute bottom-20 right-6 hidden lg:flex items-end gap-2.5">
          {photos.slice(0, 3).map((photo, i) => (
            <div
              key={photo.id}
              className="w-20 h-28 rounded-lg overflow-hidden opacity-50 hover:opacity-90 transition-all duration-400 hover:scale-105"
              style={{ boxShadow: "0 4px 15px rgba(0,0,0,0.4)" }}
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
