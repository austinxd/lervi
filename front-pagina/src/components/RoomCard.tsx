import Link from "next/link";
import type { RoomType } from "@/lib/types";
import { VIEW_TYPE_LABELS } from "@/lib/constants";

interface RoomCardProps {
  roomType: RoomType;
  currency?: string;
  template?: string;
  index?: number;
}

export default function RoomCard({
  roomType,
  currency = "PEN",
  template = "signature",
  index,
}: RoomCardProps) {
  // Premium: Diamant-inspired — rounded, warm, clean layout
  if (template === "premium") {
    return (
      <div className="group rounded-xl overflow-hidden bg-white/[0.05] border border-white/[0.08] transition-all duration-500 hover:bg-white/[0.08] hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:-translate-y-1">
        {/* Image */}
        <div className="relative h-56 sm:h-64 overflow-hidden">
          {roomType.cover_photo ? (
            <img
              src={roomType.cover_photo}
              alt={roomType.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-white/[0.06] to-white/[0.02]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          {/* Price badge */}
          <div className="absolute top-4 right-4 bg-accent-600/90 backdrop-blur-sm rounded-full px-4 py-1.5">
            <span className="text-white text-sm font-semibold font-sans">
              {currency} {roomType.base_price}
            </span>
            <span className="text-white/70 text-xs font-sans"> /noche</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="font-serif text-xl text-white/95 mb-3 group-hover:text-accent-300 transition-colors">
            {roomType.name}
          </h3>

          {/* Specs row */}
          <div className="flex items-center gap-3 text-xs text-white/50 font-sans mb-4 flex-wrap">
            {roomType.max_adults && (
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-accent-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                </svg>
                {roomType.max_adults} huespedes
              </span>
            )}
            {roomType.size_sqm && (
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-accent-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
                {roomType.size_sqm} m²
              </span>
            )}
            {roomType.view_type && (
              <span>{VIEW_TYPE_LABELS[roomType.view_type] || roomType.view_type}</span>
            )}
          </div>

          {roomType.description && (
            <p className="text-sm text-white/40 mb-5 line-clamp-2 leading-relaxed font-sans">
              {roomType.description}
            </p>
          )}

          <Link
            href={`/habitaciones/${roomType.id}`}
            className="inline-flex items-center gap-2 text-accent-400 hover:text-accent-300 text-sm font-medium font-sans transition-colors"
          >
            Ver detalle
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  // Essential: compact, no amenity badges, price inline, simple button
  if (template === "essential") {
    return (
      <div className="card-luxury group">
        <div className="relative h-48 sm:h-56 bg-primary-100 overflow-hidden">
          {roomType.cover_photo ? (
            <img
              src={roomType.cover_photo}
              alt={roomType.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
              <svg className="w-12 h-12 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
            </div>
          )}
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-sans text-lg font-semibold text-primary-900 group-hover:text-accent-700 transition-colors">
              {roomType.name}
            </h3>
            <span className="text-sm font-semibold text-primary-800 whitespace-nowrap ml-3">
              {currency} {roomType.base_price}
              <span className="text-xs text-primary-500 font-normal"> /noche</span>
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed font-sans">
            {roomType.description}
          </p>
          <div className="flex items-center gap-3 text-xs text-primary-600 mb-4 font-sans flex-wrap">
            <span>{roomType.max_adults} adultos</span>
            {roomType.size_sqm && <span>{roomType.size_sqm} m²</span>}
            {roomType.view_type && (
              <span>{VIEW_TYPE_LABELS[roomType.view_type] || roomType.view_type}</span>
            )}
          </div>
          <Link
            href={`/habitaciones/${roomType.id}`}
            className="btn-primary w-full text-center"
          >
            Ver detalle
          </Link>
        </div>
      </div>
    );
  }

  // Signature (default): full detail card
  return (
    <div className="card-luxury group">
      <div className="relative h-48 sm:h-64 bg-primary-100 overflow-hidden">
        {roomType.cover_photo ? (
          <img
            src={roomType.cover_photo}
            alt={roomType.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
            <svg
              className="w-12 h-12 text-primary-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
              />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded px-3 py-1.5">
          <span className="text-sm font-semibold text-primary-800">
            {currency} {roomType.base_price}
          </span>
          <span className="text-xs text-primary-500"> /noche</span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="font-serif text-xl text-primary-900 mb-2 group-hover:text-accent-700 transition-colors">
          {roomType.name}
        </h3>

        <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed font-sans">
          {roomType.description}
        </p>

        <div className="flex items-center gap-3 text-xs text-primary-600 mb-5 font-sans flex-wrap">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
            </svg>
            {roomType.max_adults} adultos
          </span>
          {roomType.max_children > 0 && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
              </svg>
              {roomType.max_children} menores
            </span>
          )}
          {roomType.size_sqm && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
              {roomType.size_sqm} m²
            </span>
          )}
          {roomType.view_type && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Vista: {VIEW_TYPE_LABELS[roomType.view_type] || roomType.view_type}
            </span>
          )}
        </div>

        {roomType.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {roomType.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="bg-sand-100 text-primary-600 text-xs px-2.5 py-1 rounded font-sans"
              >
                {amenity}
              </span>
            ))}
            {roomType.amenities.length > 3 && (
              <span className="text-primary-400 text-xs px-2 py-1 font-sans">
                +{roomType.amenities.length - 3}
              </span>
            )}
          </div>
        )}

        <Link
          href={`/habitaciones/${roomType.id}`}
          className="inline-flex items-center gap-2 text-accent-600 hover:text-accent-700 text-sm font-semibold uppercase tracking-wider font-sans transition-colors"
        >
          Ver detalle
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
