import ScrollReveal from "@/components/ScrollReveal";

interface AboutSectionProps {
  description: string;
  template?: string;
}

export default function AboutSection({ description, template }: AboutSectionProps) {
  if (template === "premium") {
    return (
      <section className="py-24 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center">
              <p className="section-subtitle">Bienvenido</p>
              <h2 className="section-title mb-4">Sobre Nosotros</h2>
              <div className="w-16 h-0.5 bg-gradient-to-r from-accent-400 to-accent-600 mx-auto mb-10 rounded-full" />
              <p className="text-white/55 font-sans leading-[1.9] text-base sm:text-lg whitespace-pre-line">
                {description}
              </p>
            </div>
          </ScrollReveal>
        </div>
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
