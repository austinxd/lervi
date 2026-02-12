import type { Metadata } from "next";
import Link from "next/link";
import { getProperty, getRoomTypeDetail } from "@/lib/api";
import { VIEW_TYPE_LABELS, BATHROOM_TYPE_LABELS } from "@/lib/constants";
import PhotoGallery from "./PhotoGallery";

interface Props {
  params: Promise<{ slug: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, id } = await params;
  try {
    const [property, roomType] = await Promise.all([
      getProperty(slug),
      getRoomTypeDetail(slug, id),
    ]);
    return {
      title: roomType.name,
      description: `${roomType.name} en ${property.name}. Desde ${property.currency} ${roomType.base_price} por noche.`,
      openGraph: {
        images: roomType.cover_photo ? [roomType.cover_photo] : [],
      },
    };
  } catch {
    return { title: "Habitacion" };
  }
}

export default async function RoomTypeDetailPage({ params }: Props) {
  const { slug, id } = await params;
  let property, roomType;
  try {
    [property, roomType] = await Promise.all([
      getProperty(slug),
      getRoomTypeDetail(slug, id),
    ]);
  } catch {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 font-sans">Habitacion no encontrada.</p>
      </div>
    );
  }

  const currency = property.currency || "PEN";

  return (
    <div>
      {/* Page Header */}
      <div className="bg-primary-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/habitaciones"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm font-sans mb-4 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Todas las habitaciones
          </Link>
          <h1 className="font-serif text-3xl sm:text-4xl text-white">
            {roomType.name}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PhotoGallery photos={roomType.photos} name={roomType.name} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
          {/* Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Highlights */}
            {roomType.highlights.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {roomType.highlights.map((highlight) => (
                  <span
                    key={highlight}
                    className="inline-flex items-center gap-1.5 bg-accent-50 text-accent-700 text-sm font-sans font-medium px-3 py-1.5 rounded-full"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    {highlight}
                  </span>
                ))}
              </div>
            )}

            <div>
              <p className="section-subtitle">Descripcion</p>
              <p className="text-gray-600 font-sans leading-relaxed">
                {roomType.description}
              </p>
            </div>

            <div className="flex gap-8 py-6 border-y border-sand-200 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sand-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-sans uppercase tracking-wider">Adultos</p>
                  <p className="text-primary-900 font-semibold font-sans">Hasta {roomType.max_adults}</p>
                </div>
              </div>
              {roomType.max_children > 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sand-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-sans uppercase tracking-wider">Menores</p>
                    <p className="text-primary-900 font-semibold font-sans">Hasta {roomType.max_children}</p>
                  </div>
                </div>
              )}
              {roomType.size_sqm && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sand-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-sans uppercase tracking-wider">Tamaño</p>
                    <p className="text-primary-900 font-semibold font-sans">{roomType.size_sqm} m²</p>
                  </div>
                </div>
              )}
              {roomType.view_type && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sand-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-sans uppercase tracking-wider">Vista</p>
                    <p className="text-primary-900 font-semibold font-sans">
                      {VIEW_TYPE_LABELS[roomType.view_type] || roomType.view_type}
                    </p>
                  </div>
                </div>
              )}
              {roomType.bathroom_type && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sand-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-sans uppercase tracking-wider">Baño</p>
                    <p className="text-primary-900 font-semibold font-sans">
                      {BATHROOM_TYPE_LABELS[roomType.bathroom_type] || roomType.bathroom_type}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {roomType.amenities.length > 0 && (
              <div>
                <p className="section-subtitle">Amenidades</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {roomType.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-2 text-sm text-gray-600 font-sans"
                    >
                      <svg className="w-4 h-4 text-accent-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {roomType.bed_configurations.length > 0 && (
              <div>
                <p className="section-subtitle">Configuraciones de cama</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {roomType.bed_configurations.map((config) => (
                    <div
                      key={config.id}
                      className="bg-sand-50 border border-sand-200 rounded-lg p-4"
                    >
                      <p className="font-serif text-primary-900 font-medium mb-1">
                        {config.name}
                      </p>
                      <p className="text-sm text-gray-500 font-sans">
                        {config.details
                          .map((d) => `${d.quantity}x ${d.bed_type}`)
                          .join(", ")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white border border-sand-200 rounded-lg p-8 sticky top-28 shadow-sm">
              <p className="text-xs text-gray-400 font-sans uppercase tracking-wider mb-1">
                Desde
              </p>
              <div className="mb-2">
                <span className="font-serif text-3xl text-primary-900 font-semibold">
                  {currency} {roomType.base_price}
                </span>
                <span className="text-gray-400 font-sans text-sm"> /noche</span>
              </div>
              <p className="text-xs text-gray-400 font-sans mb-8">
                Precio base. El precio final puede variar segun temporada y fechas.
              </p>
              <Link
                href="/disponibilidad"
                className="btn-primary w-full"
              >
                Buscar Disponibilidad
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
