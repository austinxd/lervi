interface AboutSectionProps {
  description: string;
}

export default function AboutSection({ description }: AboutSectionProps) {
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
