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
  incomplete: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  check_in: "bg-blue-100 text-blue-800",
  check_out: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
  no_show: "bg-red-100 text-red-800",
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
      router.replace(`/${slug}/iniciar-sesion`);
      return;
    }
    setGuestName(getGuestName());
    getGuestReservations(slug, token)
      .then(setReservations)
      .catch((err) => {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          clearGuestSession();
          router.replace(`/${slug}/iniciar-sesion`);
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
    router.push(`/${slug}`);
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
              Cerrar sesión
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
                Aún no ha realizado ninguna reserva.
              </p>
              <Link href={`/${slug}/disponibilidad`} className="btn-primary">
                Buscar disponibilidad
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {reservations.map((r) => (
                <div
                  key={r.confirmation_code}
                  className="bg-white rounded-lg border border-sand-200 p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 space-y-3">
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
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium text-primary-900">
                            {r.room_type}
                          </span>
                        </p>
                        <p>
                          {formatDate(r.check_in_date)} —{" "}
                          {formatDate(r.check_out_date)}
                        </p>
                        <p>
                          Pago:{" "}
                          {FINANCIAL_LABELS[r.financial_status] ||
                            r.financial_status}
                        </p>
                        {r.voucher_image && (
                          <p className="text-green-600 flex items-center gap-1">
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
                    </div>

                    <div className="text-right space-y-3">
                      <p className="font-serif text-xl text-primary-900">
                        {r.currency} {r.total_amount}
                      </p>

                      {(r.operational_status === "incomplete" || r.operational_status === "pending") && (
                        <>
                          {confirmCancel === r.confirmation_code ? (
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                onClick={() => setConfirmCancel(null)}
                                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 border border-gray-300 rounded-lg transition-colors"
                              >
                                No
                              </button>
                              <button
                                onClick={() =>
                                  handleCancel(r.confirmation_code)
                                }
                                disabled={
                                  cancellingCode === r.confirmation_code
                                }
                                className="text-sm text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                              >
                                {cancellingCode === r.confirmation_code
                                  ? "Cancelando..."
                                  : "Sí, cancelar"}
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() =>
                                setConfirmCancel(r.confirmation_code)
                              }
                              className="text-sm text-red-600 hover:text-red-700 font-medium"
                            >
                              Cancelar reserva
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
