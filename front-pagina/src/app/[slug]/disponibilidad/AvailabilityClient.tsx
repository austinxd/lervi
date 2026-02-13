"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { searchAvailability } from "@/lib/api";
import PriceBreakdown from "@/components/PriceBreakdown";
import type { AvailabilityResult, CombinationResult } from "@/lib/types";

interface Props {
  slug: string;
}

export default function AvailabilityClient({ slug }: Props) {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [results, setResults] = useState<AvailabilityResult[]>([]);
  const [combinations, setCombinations] = useState<CombinationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!checkIn || !checkOut) return;
    setLoading(true);
    setError("");
    try {
      const data = await searchAvailability(
        slug,
        checkIn,
        checkOut,
        adults,
        children
      );
      setResults(data.results);
      setCombinations(data.combinations);
      setSearched(true);
    } catch {
      setError("No se pudo consultar la disponibilidad.");
      setResults([]);
      setCombinations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCombination = (combo: CombinationResult) => {
    const comboData = {
      rooms: combo.rooms.map((r) => ({
        room_type_id: r.room_type.id,
        room_type_name: r.room_type.name,
        cover_photo: r.room_type.cover_photo,
        quantity: r.quantity,
        adults_per_room: r.adults_per_room,
        children_per_room: r.children_per_room,
        subtotal: r.subtotal,
      })),
      total: combo.total,
      check_in: checkIn,
      check_out: checkOut,
    };
    sessionStorage.setItem("group_combination", JSON.stringify(comboData));
    router.push("/reservar-grupo");
  };

  return (
    <div>
      {/* Page Header */}
      <div className="bg-primary-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-accent-400 text-sm uppercase tracking-[0.3em] font-sans font-medium mb-4">
            Reservaciones
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl text-white">
            Buscar Disponibilidad
          </h1>
          <div className="divider-gold mx-auto mt-6" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-lg border border-sand-200 -mt-20 relative z-10 mb-12 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_auto]">
            {/* Check-in */}
            <div className="p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-sand-200">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 font-sans mb-2 block">
                Llegada
              </label>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    type="date"
                    value={checkIn}
                    min={today}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="input-field !border-0 !px-0 !py-0 !ring-0 !shadow-none focus:!ring-0 text-primary-900 font-medium"
                  />
                  {checkIn && (
                    <p className="text-xs text-gray-400 font-sans mt-0.5 capitalize truncate">
                      {new Date(checkIn + "T12:00:00").toLocaleDateString("es", { weekday: "long", day: "numeric", month: "short" })}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Check-out */}
            <div className="p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-sand-200">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 font-sans mb-2 block">
                Salida
                {checkIn && checkOut && (
                  <span className="ml-2 text-accent-600 normal-case tracking-normal font-medium">
                    {Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))} noche(s)
                  </span>
                )}
              </label>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn || today}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="input-field !border-0 !px-0 !py-0 !ring-0 !shadow-none focus:!ring-0 text-primary-900 font-medium"
                  />
                  {checkOut && (
                    <p className="text-xs text-gray-400 font-sans mt-0.5 capitalize truncate">
                      {new Date(checkOut + "T12:00:00").toLocaleDateString("es", { weekday: "long", day: "numeric", month: "short" })}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Guests */}
            <div className="p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-sand-200">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 font-sans mb-2 block">
                Huespedes
              </label>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-4">
                    {/* Adults */}
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 font-sans mb-1.5">Adultos</p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setAdults(Math.max(1, adults - 1))}
                          className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-accent-500 hover:text-accent-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          disabled={adults <= 1}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                          </svg>
                        </button>
                        <span className="text-sm font-semibold text-primary-900 w-5 text-center font-sans">{adults}</span>
                        <button
                          type="button"
                          onClick={() => setAdults(Math.min(10, adults + 1))}
                          className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-accent-500 hover:text-accent-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          disabled={adults >= 10}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-10 bg-gray-200 flex-shrink-0" />

                    {/* Children */}
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 font-sans mb-1.5">Menores</p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setChildren(Math.max(0, children - 1))}
                          className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-accent-500 hover:text-accent-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          disabled={children <= 0}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                          </svg>
                        </button>
                        <span className="text-sm font-semibold text-primary-900 w-5 text-center font-sans">{children}</span>
                        <button
                          type="button"
                          onClick={() => setChildren(Math.min(6, children + 1))}
                          className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-accent-500 hover:text-accent-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          disabled={children >= 6}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Button */}
            <div className="p-5 lg:p-6 flex items-center">
              <button
                onClick={handleSearch}
                disabled={!checkIn || !checkOut || loading}
                className="btn-primary w-full lg:w-auto h-full min-h-[56px] lg:min-h-0 lg:px-10 lg:py-8 disabled:opacity-40 flex items-center justify-center gap-2.5"
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                    <span className="lg:hidden">Buscar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-8 font-sans text-sm">
            {error}
          </div>
        )}

        {/* No results */}
        {searched && !loading && results.length === 0 && combinations.length === 0 && (
          <div className="text-center py-16">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
              />
            </svg>
            <p className="text-gray-500 font-sans">
              No hay habitaciones disponibles para las fechas seleccionadas.
            </p>
            <p className="text-gray-400 font-sans text-sm mt-2">
              Intente con otras fechas o menos huespedes.
            </p>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-500 font-sans">
              {results.length} tipo(s) de habitacion disponible(s)
            </p>

            {results.map((result) => (
              <div
                key={result.room_type.id}
                className="bg-white border border-sand-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 animate-fade-in-up"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="md:w-72 h-56 md:h-auto bg-primary-100 flex-shrink-0 relative overflow-hidden">
                    {result.room_type.cover_photo ? (
                      <img
                        src={result.room_type.cover_photo}
                        alt={result.room_type.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
                        <svg
                          className="w-10 h-10 text-primary-300"
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
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-8">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      <div className="flex-1">
                        <h3 className="font-serif text-2xl text-primary-900 mb-2">
                          {result.room_type.name}
                        </h3>
                        <p className="text-sm text-gray-500 font-sans leading-relaxed mb-3">
                          {result.room_type.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-accent-600 font-sans font-medium">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4.5 12.75l6 6 9-13.5"
                            />
                          </svg>
                          {result.available_rooms} habitacion(es) disponible(s)
                        </div>
                      </div>

                      <div className="lg:text-right flex-shrink-0">
                        <p className="text-xs text-gray-400 font-sans uppercase tracking-wider mb-1">
                          {result.nightly_prices.length} noche(s)
                        </p>
                        <p className="font-serif text-3xl text-primary-900 font-semibold">
                          PEN {result.total}
                        </p>
                        <Link
                          href={`/reservar?room_type=${result.room_type.id}&check_in=${checkIn}&check_out=${checkOut}&adults=${adults}&children=${children}`}
                          className="btn-primary mt-4 !text-xs"
                        >
                          Reservar
                        </Link>
                      </div>
                    </div>

                    {/* Price breakdown toggle */}
                    <button
                      onClick={() =>
                        setExpanded(
                          expanded === result.room_type.id
                            ? null
                            : result.room_type.id
                        )
                      }
                      className="mt-4 text-sm text-accent-600 hover:text-accent-700 font-sans font-medium inline-flex items-center gap-1 transition-colors"
                    >
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          expanded === result.room_type.id ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                        />
                      </svg>
                      {expanded === result.room_type.id
                        ? "Ocultar desglose"
                        : "Ver desglose de precios"}
                    </button>

                    {expanded === result.room_type.id && (
                      <div className="mt-4 animate-slide-up">
                        <PriceBreakdown
                          nightlyPrices={result.nightly_prices}
                          total={result.total}
                          currency="PEN"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Group Combinations */}
        {combinations.length > 0 && (
          <div className="mt-12 space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary-500 font-sans">
                Opciones para Grupos
              </p>
              <p className="text-sm text-gray-400 font-sans mt-1">
                Combine varias habitaciones para acomodar a todo su grupo
              </p>
            </div>

            {combinations.map((combo, comboIdx) => (
              <div
                key={comboIdx}
                className="bg-white border border-sand-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 animate-fade-in-up"
              >
                <div className="p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <svg className="w-5 h-5 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                    </svg>
                    <h3 className="font-serif text-lg text-primary-900">
                      Opcion {comboIdx + 1} — {combo.rooms.reduce((sum, r) => sum + r.quantity, 0)} habitacion(es)
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {combo.rooms.map((room, roomIdx) => (
                      <div
                        key={roomIdx}
                        className="flex items-center gap-4 bg-sand-50 rounded-lg p-4 border border-sand-100"
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-primary-100">
                          {room.room_type.cover_photo ? (
                            <img
                              src={room.room_type.cover_photo}
                              alt={room.room_type.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-6 h-6 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-serif text-sm text-primary-900 font-medium truncate">
                            {room.quantity > 1 && `${room.quantity}x `}{room.room_type.name}
                          </p>
                          <p className="text-xs text-gray-400 font-sans mt-0.5">
                            {room.adults_per_room} adulto(s){room.children_per_room > 0 && `, ${room.children_per_room} menor(es)`} por hab.
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-serif text-sm text-primary-900 font-semibold">
                            PEN {room.subtotal}
                          </p>
                          {room.quantity > 1 && (
                            <p className="text-xs text-gray-400 font-sans">
                              x{room.quantity}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-sand-100">
                    <div>
                      <p className="text-xs text-gray-400 font-sans uppercase tracking-wider">
                        Total del grupo
                      </p>
                      <p className="font-serif text-2xl text-primary-900 font-semibold">
                        PEN {combo.total}
                      </p>
                    </div>
                    <button
                      onClick={() => handleSelectCombination(combo)}
                      className="btn-primary !text-xs"
                    >
                      Reservar Grupo
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
