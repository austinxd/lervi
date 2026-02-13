"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getGuestReservations, cancelGuestReservation, ApiError } from "@/lib/api";
import { getGuestToken, getGuestName, clearGuestSession } from "@/lib/guest-auth";
import type { GuestReservation } from "@/lib/types";

interface Props {
  slug: string;
}

const STATUS_LABELS: Record<string, string> = {
  incomplete: "Incompleta",
  pending: "Pendiente",
  confirmed: "Confirmada",
  check_in: "Check-in",
  check_out: "Check-out",
  cancelled: "Cancelada",
  no_show: "No-show",
};

const STATUS_COLORS: Record<string, string> = {
  incomplete: "bg-orange-100 text-orange-800 border-orange-200",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-green-100 text-green-800 border-green-200",
  check_in: "bg-blue-100 text-blue-800 border-blue-200",
  check_out: "bg-gray-100 text-gray-800 border-gray-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  no_show: "bg-red-100 text-red-800 border-red-200",
};

const STATUS_BORDER: Record<string, string> = {
  incomplete: "border-l-orange-400",
  pending: "border-l-yellow-400",
  confirmed: "border-l-green-500",
  check_in: "border-l-blue-500",
  check_out: "border-l-gray-400",
  cancelled: "border-l-red-400",
  no_show: "border-l-red-400",
};

const FINANCIAL_LABELS: Record<string, string> = {
  pending_payment: "Pendiente de pago",
  partial: "Parcial",
  paid: "Pagada",
  partial_refund: "Reembolso parcial",
  refunded: "Reembolsada",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn + "T00:00:00");
  const end = new Date(checkOut + "T00:00:00");
  return Math.max(Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)), 1);
}

function CountdownBadge({ deadline }: { deadline: string }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const diff = Math.max(0, new Date(deadline).getTime() - now);
  const expired = diff === 0;
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  if (expired) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Expirado
      </span>
    );
  }

  const isUrgent = diff < 10 * 60 * 1000;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${isUrgent ? "text-red-600" : "text-amber-600"}`}>
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="font-mono">{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}</span>
    </span>
  );
}

export default function ReservationsClient({ slug }: Props) {
  const router = useRouter();
  const [reservations, setReservations] = useState<GuestReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [guestName, setGuestName] = useState<string | null>(null);
  const [cancellingCode, setCancellingCode] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getGuestToken();
    if (!token) {
      router.replace("/iniciar-sesion");
      return;
    }
    setGuestName(getGuestName());
    getGuestReservations(slug, token)
      .then(setReservations)
      .catch((err) => {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          clearGuestSession();
          router.replace("/iniciar-sesion");
        } else {
          setError("Error al cargar sus reservas. Intente nuevamente.");
        }
      })
      .finally(() => setLoading(false));
  }, [slug, router]);

  const handleCancel = async (code: string) => {
    const token = getGuestToken();
    if (!token) return;
    setCancellingCode(code);
    setError(null);
    try {
      await cancelGuestReservation(slug, code, token);
      setReservations((prev) =>
        prev.map((r) =>
          r.confirmation_code === code
            ? { ...r, operational_status: "cancelled" }
            : r
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cancelar la reserva"
      );
    } finally {
      setCancellingCode(null);
      setConfirmCancel(null);
    }
  };

  const handleLogout = () => {
    clearGuestSession();
    router.push("/");
  };

  if (loading) {
    return (
      <>
        <section className="bg-primary-900 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-serif text-4xl text-white">Mis Reservas</h1>
          </div>
        </section>
        <section className="py-12 bg-sand-50 min-h-[60vh] flex items-center justify-center">
          <svg
            className="animate-spin h-8 w-8 text-primary-700"
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
        </section>
      </>
    );
  }

  return (
    <>
      <section className="bg-primary-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-serif text-4xl text-white mb-2">
                Mis Reservas
              </h1>
              {guestName && (
                <p className="text-white/70 text-lg">Hola, {guestName}</p>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="text-white/70 hover:text-white text-sm font-medium border border-white/20 rounded-lg px-4 py-2 transition-colors self-start"
            >
              Cerrar sesion
            </button>
          </div>
        </div>
      </section>

      <section className="py-12 bg-sand-50 min-h-[60vh]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm mb-6">
              {error}
            </div>
          )}

          {reservations.length === 0 ? (
            <div className="bg-white rounded-lg border border-sand-200 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-sand-100 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-sand-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-xl text-primary-900 mb-2">
                No tiene reservas
              </h3>
              <p className="text-gray-500 mb-6">
                Aun no ha realizado ninguna reserva.
              </p>
              <Link href="/disponibilidad" className="btn-primary">
                Buscar disponibilidad
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {reservations.map((r) => {
                const nights = calculateNights(r.check_in_date, r.check_out_date);
                return (
                  <Link
                    key={r.confirmation_code}
                    href={`/mis-reservas/${r.confirmation_code}`}
                    className={`block bg-white rounded-lg border border-sand-200 border-l-4 ${STATUS_BORDER[r.operational_status] || "border-l-gray-300"} hover:shadow-md transition-shadow`}
                  >
                    <div className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          {/* Header: codigo + estado */}
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="font-mono text-sm font-semibold text-primary-900">
                              {r.confirmation_code}
                            </span>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[r.operational_status] || "bg-gray-100 text-gray-800"}`}
                            >
                              {STATUS_LABELS[r.operational_status] ||
                                r.operational_status}
                            </span>
                            {/* Countdown badge para incomplete con deadline */}
                            {r.operational_status === "incomplete" &&
                              r.payment_deadline && (
                                <CountdownBadge deadline={r.payment_deadline} />
                              )}
                          </div>

                          {/* Info grid al estilo Casa Austin */}
                          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{formatDate(r.check_in_date)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{nights} {nights === 1 ? "noche" : "noches"}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                              </svg>
                              <span className="font-medium text-primary-900">{r.room_type}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>
                                {FINANCIAL_LABELS[r.financial_status] ||
                                  r.financial_status}
                              </span>
                            </div>
                          </div>

                          {r.voucher_image && (
                            <p className="text-green-600 flex items-center gap-1 text-sm">
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
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Comprobante enviado
                            </p>
                          )}
                        </div>

                        <div className="text-right space-y-3 shrink-0">
                          <p className="font-serif text-xl text-primary-900">
                            {r.currency} {r.total_amount}
                          </p>
                          <p className="text-xs text-gray-400">{r.property_name}</p>

                          {(r.operational_status === "incomplete" || r.operational_status === "pending") && (
                            <>
                              {confirmCancel === r.confirmation_code ? (
                                <div
                                  className="flex items-center gap-2 justify-end"
                                  onClick={(e) => e.preventDefault()}
                                >
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setConfirmCancel(null);
                                    }}
                                    className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 border border-gray-300 rounded-lg transition-colors"
                                  >
                                    No
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleCancel(r.confirmation_code);
                                    }}
                                    disabled={
                                      cancellingCode === r.confirmation_code
                                    }
                                    className="text-sm text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                  >
                                    {cancellingCode === r.confirmation_code
                                      ? "Cancelando..."
                                      : "Si, cancelar"}
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setConfirmCancel(r.confirmation_code);
                                  }}
                                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                                >
                                  Cancelar reserva
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Footer: ver detalle */}
                      <div className="mt-4 pt-3 border-t border-sand-100 flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {formatDate(r.check_in_date)} — {formatDate(r.check_out_date)}
                        </span>
                        <span className="text-sm text-accent-600 font-medium flex items-center gap-1">
                          Ver detalle
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
