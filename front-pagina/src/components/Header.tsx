"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getGuestToken, getGuestName, clearGuestSession } from "@/lib/guest-auth";

interface HeaderProps {
  propertyName: string;
  logo?: string | null;
  template?: string;
  slug?: string;
}

const TEMPLATE_STYLES: Record<string, {
  header: string;
  link: string;
  name: string;
  mobileMenu: string;
  mobileLink: string;
  logoFallbackBg: string;
}> = {
  essential: {
    header: "bg-white border-b border-gray-200",
    link: "text-gray-600 hover:text-gray-900",
    name: "text-gray-900 group-hover:text-accent-600",
    mobileMenu: "bg-white border-t border-gray-200",
    mobileLink: "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
    logoFallbackBg: "bg-accent-500",
  },
  signature: {
    header: "bg-primary-900/95 backdrop-blur-sm border-b border-white/10",
    link: "text-white/80 hover:text-white",
    name: "text-white group-hover:text-accent-300",
    mobileMenu: "bg-primary-900 border-t border-white/10",
    mobileLink: "text-white/80 hover:text-white hover:bg-white/5",
    logoFallbackBg: "bg-accent-500",
  },
  premium: {
    header: "bg-transparent border-b border-white/[0.06]",
    link: "text-white/80 hover:text-white",
    name: "text-white tracking-wide group-hover:text-accent-300",
    mobileMenu: "bg-white border-t border-gray-100",
    mobileLink: "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
    logoFallbackBg: "bg-accent-600",
  },
};

export default function Header({ propertyName, logo, template = "signature", slug }: HeaderProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [guestName, setGuestName] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(template === "premium");
  const baseStyles = TEMPLATE_STYLES[template] || TEMPLATE_STYLES.signature;

  // Premium: switch to light header when scrolled past hero
  const styles = template === "premium" && scrolled
    ? {
        ...baseStyles,
        header: "bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm",
        link: "text-gray-600 hover:text-gray-900",
        name: "text-primary-900 tracking-wide group-hover:text-accent-600",
      }
    : baseStyles;

  useEffect(() => {
    setGuestName(getGuestToken() ? getGuestName() : null);
  }, []);

  useEffect(() => {
    if (template !== "premium") return;

    // If no hero behind header (internal pages), stay in "scrolled" (light) state
    const hero = document.querySelector("[data-premium-hero]");
    if (!hero) return;

    // Landing page: transparent header over the dark hero
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    // Immediately check — at top of page, show transparent header
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [template]);

  const handleLogout = () => {
    clearGuestSession();
    setGuestName(null);
    setMenuOpen(false);
    router.push("/");
  };

  const hamburgerColor = template === "essential" || (template === "premium" && scrolled) ? "text-gray-700" : "text-white";
  const reservasHref = guestName ? "/mis-reservas" : "/iniciar-sesion";

  return (
    <header className={`${styles.header} sticky top-0 z-50 transition-all duration-500`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3 group">
            {logo ? (
              <img src={logo} alt={propertyName} className="h-10 w-auto object-contain" />
            ) : (
              <div className={`w-10 h-10 rounded-full ${styles.logoFallbackBg} flex items-center justify-center`}>
                <span className="text-white font-serif text-lg font-bold">
                  {propertyName.charAt(0)}
                </span>
              </div>
            )}
            <span className={`font-serif text-xl tracking-wide transition-colors ${styles.name}`}>
              {propertyName}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`${styles.link} px-4 py-2 text-sm font-medium tracking-wide uppercase transition-colors`}
            >
              Inicio
            </Link>
            <Link
              href="/habitaciones"
              className={`${styles.link} px-4 py-2 text-sm font-medium tracking-wide uppercase transition-colors`}
            >
              Habitaciones
            </Link>
            <Link
              href="/disponibilidad"
              className={`${styles.link} px-4 py-2 text-sm font-medium tracking-wide uppercase transition-colors`}
            >
              Disponibilidad
            </Link>
            <Link
              href={reservasHref}
              className={`${styles.link} px-4 py-2 text-sm font-medium tracking-wide uppercase transition-colors`}
            >
              Mis Reservas
            </Link>
            {guestName ? (
              <button
                onClick={handleLogout}
                className={`${styles.link} px-4 py-2 text-sm font-medium tracking-wide transition-colors`}
              >
                Cerrar sesión
              </button>
            ) : (
              <Link
                href="/disponibilidad"
                className="ml-4 btn-primary !py-2.5 !px-6 !text-xs"
              >
                Reservar Ahora
              </Link>
            )}
          </nav>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`md:hidden ${hamburgerColor} p-2`}
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className={`md:hidden ${styles.mobileMenu}`}>
          <div className="px-4 py-4 space-y-1">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className={`block ${styles.mobileLink} px-4 py-3 text-sm font-medium tracking-wide uppercase transition-colors rounded`}
            >
              Inicio
            </Link>
            <Link
              href="/habitaciones"
              onClick={() => setMenuOpen(false)}
              className={`block ${styles.mobileLink} px-4 py-3 text-sm font-medium tracking-wide uppercase transition-colors rounded`}
            >
              Habitaciones
            </Link>
            <Link
              href="/disponibilidad"
              onClick={() => setMenuOpen(false)}
              className={`block ${styles.mobileLink} px-4 py-3 text-sm font-medium tracking-wide uppercase transition-colors rounded`}
            >
              Disponibilidad
            </Link>
            <Link
              href={reservasHref}
              onClick={() => setMenuOpen(false)}
              className={`block ${styles.mobileLink} px-4 py-3 text-sm font-medium tracking-wide uppercase transition-colors rounded`}
            >
              Mis Reservas
            </Link>
            {guestName ? (
              <div className="pt-3 space-y-2">
                <p className={`px-4 text-sm ${styles.mobileLink} opacity-70`}>
                  {guestName}
                </p>
                <button
                  onClick={handleLogout}
                  className={`block w-full text-left ${styles.mobileLink} px-4 py-3 text-sm font-medium tracking-wide transition-colors rounded`}
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <div className="pt-3">
                <Link
                  href="/disponibilidad"
                  onClick={() => setMenuOpen(false)}
                  className="btn-primary w-full"
                >
                  Reservar Ahora
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
