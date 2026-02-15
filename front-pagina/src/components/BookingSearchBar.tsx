"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BookingSearchBar() {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [guestOpen, setGuestOpen] = useState(false);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (checkIn) params.set("check_in", checkIn);
    if (checkOut) params.set("check_out", checkOut);
    params.set("adults", String(adults));
    params.set("children", String(children));
    router.push(`/disponibilidad?${params.toString()}`);
  };

  const totalGuests = adults + children;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return null;
    return new Date(dateStr + "T12:00:00").toLocaleDateString("es", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row items-stretch gap-4 lg:gap-0 lg:divide-x lg:divide-gray-200">
          {/* Check-in */}
          <div className="flex-1 lg:pr-6">
            <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-gray-400 font-sans mb-2">
              Llegada
            </label>
            <div className="relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-[0.5rem] bg-accent-50 flex items-center justify-center pointer-events-none">
                <svg className="w-5 h-5 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
              </div>
              <input
                type="date"
                value={checkIn}
                min={today}
                onChange={(e) => {
                  setCheckIn(e.target.value);
                  if (checkOut && e.target.value >= checkOut) setCheckOut("");
                }}
                className="w-full pl-14 pr-3 py-2.5 text-primary-900 font-medium font-sans text-sm border border-gray-200 rounded-[0.5rem] focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 transition-colors bg-white cursor-pointer"
              />
              {checkIn && (
                <p className="text-[0.7rem] text-gray-400 font-sans mt-1 capitalize pl-14">
                  {formatDate(checkIn)}
                </p>
              )}
            </div>
          </div>

          {/* Check-out */}
          <div className="flex-1 lg:px-6">
            <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-gray-400 font-sans mb-2">
              Salida
              {checkIn && checkOut && (
                <span className="ml-2 text-accent-600 normal-case tracking-normal">
                  ({Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))} noches)
                </span>
              )}
            </label>
            <div className="relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-[0.5rem] bg-accent-50 flex items-center justify-center pointer-events-none">
                <svg className="w-5 h-5 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
              </div>
              <input
                type="date"
                value={checkOut}
                min={checkIn || today}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full pl-14 pr-3 py-2.5 text-primary-900 font-medium font-sans text-sm border border-gray-200 rounded-[0.5rem] focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 transition-colors bg-white cursor-pointer"
              />
              {checkOut && (
                <p className="text-[0.7rem] text-gray-400 font-sans mt-1 capitalize pl-14">
                  {formatDate(checkOut)}
                </p>
              )}
            </div>
          </div>

          {/* Guests */}
          <div className="flex-1 lg:px-6 relative">
            <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-gray-400 font-sans mb-2">
              Huéspedes
            </label>
            <button
              type="button"
              onClick={() => setGuestOpen(!guestOpen)}
              className="w-full flex items-center gap-3 pl-14 pr-3 py-2.5 text-primary-900 font-medium font-sans text-sm border border-gray-200 rounded-[0.5rem] hover:border-gray-300 transition-colors bg-white text-left relative"
            >
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-[0.5rem] bg-accent-50 flex items-center justify-center pointer-events-none">
                <svg className="w-5 h-5 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" />
                </svg>
              </div>
              <span className="flex-1">
                {adults} adulto{adults !== 1 ? "s" : ""}
                {children > 0 && `, ${children} menor${children !== 1 ? "es" : ""}`}
              </span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${guestOpen ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {/* Guest dropdown */}
            {guestOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setGuestOpen(false)} />
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-[0.625rem] border border-gray-200 shadow-xl z-20 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-primary-900 font-sans">Adultos</p>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))} disabled={adults <= 1}
                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-accent-500 hover:text-accent-600 transition-colors disabled:opacity-30">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /></svg>
                      </button>
                      <span className="w-6 text-center font-semibold text-sm text-primary-900 font-sans">{adults}</span>
                      <button type="button" onClick={() => setAdults(Math.min(10, adults + 1))} disabled={adults >= 10}
                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-accent-500 hover:text-accent-600 transition-colors disabled:opacity-30">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-primary-900 font-sans">Menores</p>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => setChildren(Math.max(0, children - 1))} disabled={children <= 0}
                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-accent-500 hover:text-accent-600 transition-colors disabled:opacity-30">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /></svg>
                      </button>
                      <span className="w-6 text-center font-semibold text-sm text-primary-900 font-sans">{children}</span>
                      <button type="button" onClick={() => setChildren(Math.min(6, children + 1))} disabled={children >= 6}
                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-accent-500 hover:text-accent-600 transition-colors disabled:opacity-30">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Search Button */}
          <div className="lg:pl-6 flex items-end">
            <button
              onClick={handleSearch}
              className="btn-primary w-full lg:w-auto !rounded-[0.5rem] !px-10 !py-3 flex items-center justify-center gap-2.5"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              Buscar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
