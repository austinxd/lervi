"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  lookupReservation,
  getBankAccounts,
  uploadVoucher,
  cancelGuestReservation,
} from "@/lib/api";
import { getGuestToken, clearGuestSession } from "@/lib/guest-auth";
import type { BankAccount, ReservationLookup } from "@/lib/types";

interface Props {
  slug: string;
  code: string;
}

/* ── helpers ── */

function useCountdown(deadline: string | null) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!deadline) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  if (!deadline) return { minutes: 0, seconds: 0, expired: false, total: 0 };

  const diff = Math.max(0, new Date(deadline).getTime() - now);
  return {
    minutes: Math.floor(diff / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    expired: diff === 0,
    total: diff,
  };
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="text-xs text-accent-600 hover:text-accent-700 font-medium transition-colors"
    >
      {copied ? "Copiado!" : "Copiar"}
    </button>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("es-PE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn + "T00:00:00");
  const end = new Date(checkOut + "T00:00:00");
  return Math.max(
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
    1
  );
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
  incomplete: "bg-orange-100 text-orange-800",
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  check_in: "bg-blue-100 text-blue-800",
  check_out: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
  no_show: "bg-red-100 text-red-800",
};

/* ── main component ── */

export default function ReservationDetailClient({ slug, code }: Props) {
  const router = useRouter();
  const [reservation, setReservation] = useState<ReservationLookup | null>(
    null
  );
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cancel state
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const countdown = useCountdown(reservation?.payment_deadline ?? null);

  const loadData = useCallback(async () => {
    const token = getGuestToken();
    if (!token) {
      router.replace("/iniciar-sesion");
      return;
    }
    try {
      const [res, accounts] = await Promise.all([
        lookupReservation(slug, code),
        getBankAccounts(slug),
      ]);
      setReservation(res);
      setBankAccounts(accounts);
      if (res.voucher_image) setUploaded(true);
    } catch {
      setError("No se pudo cargar la reserva.");
    } finally {
      setLoading(false);
    }
  }, [slug, code, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(selected);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      await uploadVoucher(slug, code, file);
      setUploaded(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al subir el comprobante."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = async () => {
    const token = getGuestToken();
    if (!token) return;
    setCancelling(true);
    setError(null);
    try {
      await cancelGuestReservation(slug, code, token);
      setReservation((prev) =>
        prev ? { ...prev, operational_status: "cancelled" } : prev
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cancelar la reserva"
      );
    } finally {
      setCancelling(false);
      setConfirmCancel(false);
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <svg
          className="animate-spin h-8 w-8 text-accent-500"
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
      </div>
    );
  }

  /* ── Error / not found ── */
  if (!reservation) {
    return (
      <div>
        <div className="bg-primary-900 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-serif text-4xl text-white">
              Detalle de Reserva
            </h1>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <p className="text-gray-500 font-sans mb-6">
            {error || "No se encontro la reserva."}
          </p>
          <Link href="/mis-reservas" className="btn-primary">
            Volver a Mis Reservas
          </Link>
        </div>
      </div>
    );
  }

  const status = reservation.operational_status;
  const nights = calculateNights(
    reservation.check_in_date,
    reservation.check_out_date
  );
  const isIncomplete = status === "incomplete";
  const isPending = status === "pending";
  const isActive = isIncomplete || isPending;
  const deadlineExpired =
    isIncomplete && reservation.payment_deadline && countdown.expired;
  const deadlineActive =
    isIncomplete && reservation.payment_deadline && !countdown.expired;
  const isUrgent = countdown.total < 10 * 60 * 1000;

  return (
    <div>
      {/* ── Header ── */}
      <div className="bg-primary-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/mis-reservas"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm font-sans mb-6 transition-colors"
          >
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Volver a Mis Reservas
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <h1 className="font-serif text-3xl sm:text-4xl text-white">
              Reserva {reservation.confirmation_code}
            </h1>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status] || "bg-gray-100 text-gray-800"}`}
            >
              {STATUS_LABELS[status] || status}
            </span>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg font-sans text-sm mb-8">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* ── Main column (2/3) ── */}
          <div className="lg:col-span-2 space-y-8">
            {/* Countdown timer – incomplete + deadline activo */}
            {deadlineActive && (
              <div
                className={`rounded-lg p-6 border ${
                  isUrgent
                    ? "bg-red-50 border-red-200"
                    : "bg-amber-50 border-amber-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg
                    className={`w-6 h-6 ${isUrgent ? "text-red-500" : "text-amber-500"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p
                      className={`font-sans font-semibold text-sm ${isUrgent ? "text-red-700" : "text-amber-700"}`}
                    >
                      Tiempo restante para enviar comprobante
                    </p>
                    <p
                      className={`font-serif text-3xl font-bold ${isUrgent ? "text-red-600" : "text-amber-600"}`}
                    >
                      {String(countdown.minutes).padStart(2, "0")}:
                      {String(countdown.seconds).padStart(2, "0")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Deadline expirado */}
            {deadlineExpired && (
              <div className="rounded-lg p-6 border bg-red-50 border-red-200 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                    />
                  </svg>
                </div>
                <h3 className="font-serif text-xl text-red-800 mb-2">
                  Plazo Expirado
                </h3>
                <p className="text-red-600 font-sans text-sm mb-4">
                  El plazo para subir el comprobante de pago ha expirado. Su
                  reserva sera cancelada automaticamente.
                </p>
                <Link
                  href="/disponibilidad"
                  className="btn-primary inline-block"
                >
                  Buscar Nueva Disponibilidad
                </Link>
              </div>
            )}

            {/* Voucher uploaded success */}
            {uploaded && (
              <div className="rounded-lg p-6 border bg-green-50 border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <svg
                      className="w-5 h-5 text-green-600"
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
                  </div>
                  <div>
                    <p className="font-sans font-semibold text-sm text-green-800">
                      Comprobante recibido
                    </p>
                    <p className="text-green-600 text-sm">
                      El hotel revisara su pago y confirmara su reserva en
                      breve.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Confirmed / check_in status */}
            {(status === "confirmed" || status === "check_in") && (
              <div className="rounded-lg p-6 border bg-green-50 border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-sans font-semibold text-sm text-green-800">
                      {status === "confirmed"
                        ? "Reserva Confirmada"
                        : "Check-in Realizado"}
                    </p>
                    <p className="text-green-600 text-sm">
                      {status === "confirmed"
                        ? "Su reserva esta confirmada. Le esperamos en las fechas indicadas."
                        : "Bienvenido, disfrute su estancia."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Cancelled / no_show / check_out */}
            {(status === "cancelled" ||
              status === "no_show" ||
              status === "check_out") && (
              <div className="rounded-lg p-6 border bg-gray-50 border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                      />
                    </svg>
                  </div>
                  <p className="font-sans text-sm text-gray-600">
                    {status === "cancelled"
                      ? "Esta reserva ha sido cancelada."
                      : status === "no_show"
                        ? "No-show registrado para esta reserva."
                        : "Check-out completado. Gracias por su visita."}
                  </p>
                </div>
              </div>
            )}

            {/* Bank accounts – solo si incomplete + deadline activo y no uploaded */}
            {deadlineActive && !uploaded && bankAccounts.length > 0 && (
              <div>
                <p className="section-subtitle">Datos bancarios</p>
                <h3 className="font-serif text-xl text-primary-900 mb-6">
                  Realice su transferencia a cualquiera de estas cuentas
                </h3>
                <div className="space-y-4">
                  {bankAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="bg-white border border-sand-200 rounded-lg p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-sans font-semibold text-primary-900">
                          {account.bank_name}
                        </h4>
                        <span className="text-xs font-sans font-medium text-gray-400 uppercase tracking-wider bg-sand-100 px-2 py-1 rounded">
                          {account.currency}
                        </span>
                      </div>
                      <div className="space-y-3 text-sm font-sans">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-gray-400 block text-xs uppercase tracking-wider">
                              Titular
                            </span>
                            <span className="text-primary-800 font-medium">
                              {account.account_holder}
                            </span>
                          </div>
                          <CopyButton text={account.account_holder} />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-gray-400 block text-xs uppercase tracking-wider">
                              N° de cuenta
                            </span>
                            <span className="text-primary-800 font-medium font-mono">
                              {account.account_number}
                            </span>
                          </div>
                          <CopyButton text={account.account_number} />
                        </div>
                        {account.cci && (
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-gray-400 block text-xs uppercase tracking-wider">
                                CCI
                              </span>
                              <span className="text-primary-800 font-medium font-mono">
                                {account.cci}
                              </span>
                            </div>
                            <CopyButton text={account.cci} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload voucher – solo si incomplete + deadline activo y no uploaded */}
            {deadlineActive && !uploaded && (
              <div>
                <p className="section-subtitle">Comprobante de pago</p>
                <h3 className="font-serif text-xl text-primary-900 mb-6">
                  Suba su voucher de transferencia
                </h3>

                {!preview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-sand-300 rounded-lg p-12 text-center cursor-pointer hover:border-accent-400 hover:bg-sand-50 transition-colors"
                  >
                    <svg
                      className="w-12 h-12 text-gray-300 mx-auto mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                    <p className="text-gray-500 font-sans text-sm mb-1">
                      Haga clic para seleccionar una imagen
                    </p>
                    <p className="text-gray-400 font-sans text-xs">
                      JPEG, PNG o WebP — Max 5 MB
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden border border-sand-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preview}
                        alt="Preview del comprobante"
                        className="w-full max-h-96 object-contain bg-sand-50"
                      />
                      <button
                        onClick={() => {
                          setFile(null);
                          setPreview(null);
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}
                        className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full p-2 shadow-sm transition-colors"
                      >
                        <svg
                          className="w-4 h-4 text-gray-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 font-sans">
                      {file?.name} —{" "}
                      {((file?.size ?? 0) / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}

                <button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="btn-primary w-full !py-4 mt-6 disabled:opacity-50"
                >
                  {uploading ? (
                    <span className="flex items-center justify-center gap-3">
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
                      Subiendo...
                    </span>
                  ) : (
                    "Enviar Comprobante"
                  )}
                </button>
              </div>
            )}
          </div>

          {/* ── Sidebar (1/3) — Resumen de reserva ── */}
          <div className="space-y-6">
            {/* Reservation summary */}
            <div className="bg-white border border-sand-200 rounded-lg p-8 sticky top-28 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary-500 font-sans mb-4">
                Resumen de reserva
              </p>

              <div className="space-y-3 text-sm font-sans">
                <div className="flex justify-between py-2 border-b border-sand-100">
                  <span className="text-gray-400">Codigo</span>
                  <span className="text-primary-900 font-semibold font-mono">
                    {reservation.confirmation_code}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-sand-100">
                  <span className="text-gray-400">Habitacion</span>
                  <span className="text-primary-800 font-medium">
                    {reservation.room_type}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-sand-100">
                  <span className="text-gray-400">Huesped</span>
                  <span className="text-primary-800 font-medium">
                    {reservation.guest_name}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-sand-100">
                  <span className="text-gray-400">Check-in</span>
                  <span className="text-primary-800 font-medium text-right">
                    {formatDate(reservation.check_in_date)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-sand-100">
                  <span className="text-gray-400">Check-out</span>
                  <span className="text-primary-800 font-medium text-right">
                    {formatDate(reservation.check_out_date)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-sand-100">
                  <span className="text-gray-400">Noches</span>
                  <span className="text-primary-800 font-medium">{nights}</span>
                </div>
                <div className="flex justify-between py-4 bg-sand-50 -mx-8 px-8 rounded-b-lg mt-4">
                  <span className="text-sm font-semibold text-primary-700 font-sans uppercase tracking-wider">
                    Total
                  </span>
                  <span className="font-serif text-2xl text-primary-900 font-semibold">
                    {reservation.currency} {reservation.total_amount}
                  </span>
                </div>
              </div>
            </div>

            {/* Cancel action */}
            {isActive && !deadlineExpired && (
              <div className="bg-white border border-sand-200 rounded-lg p-6">
                {confirmCancel ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 font-sans">
                      Esta seguro que desea cancelar esta reserva?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmCancel(false)}
                        className="flex-1 text-sm text-gray-600 hover:text-gray-800 px-3 py-2 border border-gray-300 rounded-lg transition-colors"
                      >
                        No
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={cancelling}
                        className="flex-1 text-sm text-white bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {cancelling ? "Cancelando..." : "Si, cancelar"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmCancel(true)}
                    className="w-full text-sm text-red-600 hover:text-red-700 font-medium py-2 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Cancelar Reserva
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
