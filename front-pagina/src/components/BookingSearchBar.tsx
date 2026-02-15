"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BookingSearchBar() {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [guestOpen, setGuestOpen] = useState(false);

  const handleSearch = () => {
    const params = new URLSearchParams({
      check_in: checkIn,
      check_out: checkOut || "",
      adults: String(adults),
      children: String(children),
    });
    router.push(`/disponibilidad?${params.toString()}`);
  };

  const totalGuests = adults + children;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
      <div
        className="bg-white rounded-[0.625rem] shadow-xl border border-gray-100"
        style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.08)" }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
          {/* Check-in */}
          <div className="px-6 py-5">
            <label className="block text-[0.6rem] font-medium uppercase tracking-[0.2em] text-gray-400 font-sans mb-2">
              Llegada
            </label>
            <input
              type="date"
              value={checkIn}
              min={today}
              onChange={(e) => setCheckIn(e.target.value)}
              className="input-field !border-0 !px-0 !py-0 !ring-0 !shadow-none focus:!ring-0 text-primary-900 font-serif text-lg font-medium w-full bg-transparent"
            />
            {checkIn && (
              <p className="text-[0.7rem] text-gray-400 font-sans mt-1 capitalize">
                {new Date(checkIn + "T12:00:00").toLocaleDateString("es", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
            )}
          </div>

          {/* Check-out */}
          <div className="px-6 py-5">
            <label className="block text-[0.6rem] font-medium uppercase tracking-[0.2em] text-gray-400 font-sans mb-2">
              Salida
            </label>
            <input
              type="date"
              value={checkOut}
              min={checkIn || today}
              onChange={(e) => setCheckOut(e.target.value)}
              className="input-field !border-0 !px-0 !py-0 !ring-0 !shadow-none focus:!ring-0 text-primary-900 font-serif text-lg font-medium w-full bg-transparent"
            />
            {checkOut && (
              <p className="text-[0.7rem] text-gray-400 font-sans mt-1 capitalize">
                {new Date(checkOut + "T12:00:00").toLocaleDateString("es", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
            )}
          </div>

          {/* Guests */}
          <div className="px-6 py-5 relative">
            <label className="block text-[0.6rem] font-medium uppercase tracking-[0.2em] text-gray-400 font-sans mb-2">
              Huéspedes
            </label>
            <button
              type="button"
              onClick={() => setGuestOpen(!guestOpen)}
              className="w-full text-left font-serif text-lg font-medium text-primary-900 flex items-center justify-between"
            >
              <span>
                {totalGuests} {totalGuests === 1 ? "huésped" : "huéspedes"}
              </span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${guestOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {/* Guest dropdown */}
            {guestOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setGuestOpen(false)} />
                <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-[0.625rem] border border-gray-100 shadow-lg z-20 p-5 space-y-4">
                  {/* Adults */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-primary-900 font-sans">Adultos</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setAdults(Math.max(1, adults - 1))}
                        disabled={adults <= 1}
                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-accent-500 hover:text-accent-600 transition-colors disabled:opacity-30"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                        </svg>
                      </button>
                      <span className="w-6 text-center font-semibold text-sm text-primary-900 font-sans">{adults}</span>
                      <button
                        type="button"
                        onClick={() => setAdults(Math.min(10, adults + 1))}
                        disabled={adults >= 10}
                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-accent-500 hover:text-accent-600 transition-colors disabled:opacity-30"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-primary-900 font-sans">Menores</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setChildren(Math.max(0, children - 1))}
                        disabled={children <= 0}
                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-accent-500 hover:text-accent-600 transition-colors disabled:opacity-30"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                        </svg>
                      </button>
                      <span className="w-6 text-center font-semibold text-sm text-primary-900 font-sans">{children}</span>
                      <button
                        type="button"
                        onClick={() => setChildren(Math.min(6, children + 1))}
                        disabled={children >= 6}
                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-accent-500 hover:text-accent-600 transition-colors disabled:opacity-30"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Search Button */}
          <div className="p-3 flex items-stretch">
            <button
              onClick={handleSearch}
              className="w-full lg:w-auto bg-accent-600 hover:bg-accent-700 text-white rounded-[0.5rem] px-8 flex items-center justify-center gap-2 font-sans text-sm font-medium uppercase tracking-wider transition-colors duration-300"
              style={{ boxShadow: "0 4px 15px rgb(var(--color-accent-600-rgb) / 0.3)" }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <span className="hidden sm:inline">Buscar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
