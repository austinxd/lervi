import ScrollReveal from "@/components/ScrollReveal";

interface AboutSectionProps {
  description: string;
  template?: string;
}

export default function AboutSection({ description, template }: AboutSectionProps) {
  if (template === "premium") {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            {/* Left: editorial number */}
            <div className="lg:col-span-3 flex flex-col items-start">
              <span className="text-7xl font-serif font-extralight text-accent-500/30 leading-none mb-4">
                01
              </span>
              <div className="w-8 h-px bg-accent-500/40 mb-4" />
              <p className="text-accent-500/80 text-[0.6rem] uppercase tracking-[0.35em] font-sans font-light">
                Conozca
              </p>
            </div>

            {/* Right: content */}
            <div className="lg:col-span-9">
              <h2 className="section-title mb-8">Sobre Nosotros</h2>
              <p className="text-gray-500 font-sans leading-[1.9] text-base sm:text-lg whitespace-pre-line">
                {description}
              </p>
            </div>
          </div>
        </ScrollReveal>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      <div className="max-w-3xl mx-auto text-center">
        <p className="section-subtitle">Conozca</p>
        <h2 className="section-title mb-3">Sobre Nosotros</h2>
        <div className="divider-gold mx-auto mb-10" />
        <p className="text-gray-500 font-sans leading-[1.8] text-base sm:text-lg whitespace-pre-line">
          {description}
        </p>
      </div>
    </section>
  );
}
