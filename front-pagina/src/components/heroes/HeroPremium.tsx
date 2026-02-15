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
    if (mq.matches) return;

    // Only enable parallax on desktop
    const isDesktop = window.innerWidth >= 1024;
    if (!isDesktop) return;

    const handleScroll = () => {
      setOffsetY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center bg-black overflow-hidden">
      {/* Full-bleed background image with parallax */}
      {heroImage ? (
        <>
          <div
            className="absolute inset-0"
            style={{ transform: `translateY(${offsetY * 0.3}px)` }}
          >
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

      {/* Centered content */}
      <div className="relative z-10 text-center px-4 sm:px-6">
        {/* Thin decorative line */}
        <div
          className="w-px h-16 bg-white/20 mx-auto mb-10"
          style={{ animation: "premiumFadeDown 1.2s ease-out 0.3s both" }}
        />

        {/* City */}
        <p
          className="text-white/40 text-[0.6rem] sm:text-[0.7rem] uppercase tracking-[0.4em] font-sans font-light mb-5"
          style={{ animation: "premiumFadeUp 1s ease-out 0.6s both" }}
        >
          {city}
        </p>

        {/* Golden rule */}
        <div
          className="w-12 h-px bg-accent-500/60 mx-auto mb-5"
          style={{ animation: "premiumFadeUp 1s ease-out 0.8s both" }}
        />

        {/* Hotel name */}
        <h1
          className="text-5xl sm:text-7xl md:text-8xl lg:text-[8.5rem] xl:text-[10rem] font-serif font-extralight text-white leading-[0.9] mb-5 tracking-[-0.02em]"
          style={{ animation: "premiumFadeUp 1.2s ease-out 1.0s both" }}
        >
          {hotelName}
        </h1>

        {/* Stars */}
        {stars && stars > 0 && (
          <div
            className="flex items-center justify-center gap-1.5 mb-6"
            style={{ animation: "premiumFadeUp 1s ease-out 1.2s both" }}
          >
            {Array.from({ length: stars }).map((_, i) => (
              <svg
                key={i}
                className="w-3.5 h-3.5 text-accent-500/70"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        )}

        {/* Tagline */}
        {tagline && (
          <p
            className="text-white/35 text-sm sm:text-base font-sans font-light tracking-wide mb-12 max-w-md mx-auto"
            style={{ animation: "premiumFadeUp 1s ease-out 1.3s both" }}
          >
            {tagline}
          </p>
        )}

        {!tagline && !stars && <div className="mb-12" />}
        {!tagline && stars && stars > 0 && <div className="mb-6" />}

        {/* CTA */}
        <div style={{ animation: "premiumFadeUp 1s ease-out 1.6s both" }}>
          <Link
            href="/disponibilidad"
            className="inline-flex items-center justify-center border border-white/25 text-white/80 px-14 py-4 font-sans text-[0.6rem] sm:text-[0.65rem] font-medium uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-700"
          >
            Reservar Estancia
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        style={{ animation: "premiumFadeUp 1s ease-out 2.0s both" }}
      >
        <span className="text-white/25 text-[0.55rem] uppercase tracking-[0.3em] font-sans">
          Explorar
        </span>
        <div className="w-px h-8 bg-white/20 relative overflow-hidden">
          <div className="w-full h-full bg-white/60 animate-scrollLine" />
        </div>
      </div>

      {/* Gallery preview strip */}
      {photos.length > 0 && (
        <div
          className="absolute bottom-0 right-0 hidden lg:flex items-end gap-2 p-6"
          style={{ animation: "premiumFadeUp 1s ease-out 2.0s both" }}
        >
          {/* Connector line */}
          <div className="w-8 h-px bg-white/15 self-center mr-1" />

          {photos.slice(0, 3).map((photo, i) => (
            <div key={photo.id} className="relative group/thumb">
              {/* Editorial number */}
              <span className="absolute -top-5 left-0 text-white/30 text-[0.55rem] font-sans tracking-wider">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="w-24 h-32 overflow-hidden opacity-40 hover:opacity-80 transition-opacity duration-500">
                <img
                  src={photo.image}
                  alt={photo.caption || `${hotelName} ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
