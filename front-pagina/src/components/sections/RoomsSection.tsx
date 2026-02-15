import RoomCard from "@/components/RoomCard";
import ScrollReveal from "@/components/ScrollReveal";
import type { RoomType } from "@/lib/types";

interface RoomsSectionProps {
  roomTypes: RoomType[];
  currency: string;
  template: string;
}

export default function RoomsSection({ roomTypes, currency, template }: RoomsSectionProps) {
  if (template === "premium") {
    return (
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="section-subtitle">Alojamiento</p>
              <h2 className="section-title mb-4">Nuestras Habitaciones</h2>
              <div className="w-16 h-0.5 bg-gradient-to-r from-accent-400 to-accent-600 mx-auto rounded-full" />
            </div>
          </ScrollReveal>

          {roomTypes.length === 0 ? (
            <p className="text-center text-white/40 font-sans">
              No hay habitaciones disponibles en este momento.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {roomTypes.map((rt, i) => (
                <ScrollReveal key={rt.id} delay={100 * i}>
                  <RoomCard
                    roomType={rt}
                    currency={currency}
                    template={template}
                    index={i}
                  />
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="section-subtitle">Alojamiento</p>
          <h2 className="section-title mb-3">Nuestras Habitaciones</h2>
          <div className="divider-gold mx-auto" />
        </div>

        {roomTypes.length === 0 ? (
          <p className="text-center text-gray-400 font-sans">
            No hay habitaciones disponibles en este momento.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {roomTypes.map((rt) => (
              <RoomCard
                key={rt.id}
                roomType={rt}
                currency={currency}
                template={template}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
