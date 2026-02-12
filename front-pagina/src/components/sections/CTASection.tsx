import Link from "next/link";

interface CTASectionProps {
  template: string;
}

export default function CTASection({ template }: CTASectionProps) {
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
            directamente a través de nuestro sitio web.
          </p>

          {template === "premium" ? (
            <Link
              href="/disponibilidad"
              className="inline-flex items-center justify-center border border-white/30 text-white px-12 py-4 font-sans text-[0.7rem] font-medium uppercase tracking-[0.2em] hover:bg-white hover:text-primary-900 transition-all duration-500"
            >
              Buscar Disponibilidad
            </Link>
          ) : (
            <Link href="/disponibilidad" className="btn-primary !py-4 !px-12">
              Buscar Disponibilidad
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
