import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";

interface CTASectionProps {
  template: string;
}

export default function CTASection({ template }: CTASectionProps) {
  if (template === "premium") {
    return (
      <section className="relative overflow-hidden">
        {/* Warm gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #272535 0%, #1e1c2a 40%, #2a2540 100%)",
          }}
        />
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 40%, rgb(var(--color-accent-400-rgb)) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgb(var(--color-accent-600-rgb)) 0%, transparent 50%)",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-36">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-accent-300/80 text-xs sm:text-sm uppercase tracking-[0.25em] font-sans font-medium mb-6">
                Mejor precio garantizado
              </p>
              <div className="w-12 h-0.5 bg-gradient-to-r from-accent-400 to-accent-600 mx-auto mb-8 rounded-full" />
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white font-normal mb-6 leading-tight">
                Reserve Directamente
              </h2>
              <p className="text-white/50 font-sans max-w-lg mx-auto mb-12 leading-relaxed text-base">
                Obtenga las mejores tarifas y beneficios exclusivos reservando
                directamente a traves de nuestro sitio web.
              </p>

              <Link
                href="/disponibilidad"
                className="inline-flex items-center justify-center bg-accent-600 hover:bg-accent-500 text-white rounded-full px-10 py-4 font-sans text-sm font-medium uppercase tracking-[0.15em] transition-all duration-500 shadow-[0_4px_20px_rgba(var(--color-accent-600-rgb)/0.35)]"
              >
                Buscar Disponibilidad
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-primary-900 overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgb(var(--color-accent-400-rgb)) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgb(var(--color-primary-600-rgb)) 0%, transparent 50%)",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-accent-400 text-xs uppercase tracking-[0.3em] font-sans font-medium mb-6">
            Mejor precio garantizado
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white mb-5 leading-tight">
            Reserve Directamente
          </h2>
          <p className="text-white/50 font-sans max-w-lg mx-auto mb-12 leading-relaxed text-base">
            Obtenga las mejores tarifas y beneficios exclusivos reservando
            directamente a traves de nuestro sitio web.
          </p>

          <Link href="/disponibilidad" className="btn-primary !py-4 !px-12">
            Buscar Disponibilidad
          </Link>
        </div>
      </div>
    </section>
  );
}
