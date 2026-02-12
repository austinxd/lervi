"use client";

import { useState } from "react";
import Link from "next/link";
import { searchAvailability } from "@/lib/api";
import PriceBreakdown from "@/components/PriceBreakdown";
import type { AvailabilityResult } from "@/lib/types";

interface Props {
  slug: string;
}

export default function AvailabilityClient({ slug }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [results, setResults] = useState<AvailabilityResult[]>([]);
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
      setResults(data);
      setSearched(true);
    } catch {
      setError("No se pudo consultar la disponibilidad.");
      setResults([]);
    } finally {
      setLoading(false);
    }
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
        <div className="bg-white rounded-lg shadow-sm border border-sand-200 p-8 -mt-20 relative z-10 mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
            <div>
              <label className="label-field">Fecha de entrada</label>
              <input
                type="date"
                value={checkIn}
                min={today}
                onChange={(e) => setCheckIn(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field">Fecha de salida</label>
              <input
                type="date"
                value={checkOut}
                min={checkIn || today}
                onChange={(e) => setCheckOut(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="label-field">Adultos</label>
                <select
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                  className="input-field"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="label-field">Menores</label>
                <select
                  value={children}
                  onChange={(e) => setChildren(Number(e.target.value))}
                  className="input-field"
                >
                  {[0, 1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={handleSearch}
              disabled={!checkIn || !checkOut || loading}
              className="btn-primary h-[48px] disabled:opacity-50"
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
                "Buscar"
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-8 font-sans text-sm">
            {error}
          </div>
        )}

        {/* No results */}
        {searched && !loading && results.length === 0 && (
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
      </div>
    </div>
  );
}
