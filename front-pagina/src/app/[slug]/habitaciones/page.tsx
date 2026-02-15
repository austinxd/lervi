import type { Metadata } from "next";
import { getOrganizationInfo, getRoomTypes } from "@/lib/api";
import { resolveTemplateKey } from "@/lib/theme-resolver";
import RoomCard from "@/components/RoomCard";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const org = await getOrganizationInfo(slug);
  return {
    title: "Habitaciones",
    description: `Tipos de habitacion en ${org.name}. Consulte precios y reserve online.`,
  };
}

export default async function RoomTypesPage({ params }: Props) {
  const { slug } = await params;
  const [org, roomTypes] = await Promise.all([
    getOrganizationInfo(slug),
    getRoomTypes(slug),
  ]);

  const template = resolveTemplateKey(org.theme_template);

  return (
    <div>
      {/* Page Header */}
      <div className="bg-primary-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-accent-400 text-sm uppercase tracking-[0.3em] font-sans font-medium mb-4">
            Alojamiento
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl text-white">
            Nuestras Habitaciones
          </h1>
          <div className="divider-gold mx-auto mt-6" />
        </div>
      </div>

      {/* Room Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {roomTypes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 font-sans">
              No hay habitaciones disponibles en este momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {roomTypes.map((rt, i) => (
              <RoomCard
                key={rt.id}
                roomType={rt}
                currency={org.currency}
                template={template}
                index={i}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
