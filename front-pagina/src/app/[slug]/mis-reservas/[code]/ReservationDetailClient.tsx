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
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDateShort(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
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
  incomplete: "Pendiente de pago",
  pending: "En validacion",
  confirmed: "Confirmada",
  check_in: "Check-in",
  check_out: "Check-out",
  cancelled: "Cancelada",
  no_show: "No-show",
};

const STATUS_COLORS: Record<string, string> = {
  incomplete: "bg-amber-100 text-amber-800",
  pending: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  check_in: "bg-green-100 text-green-800",
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

  // Currency tab state
  const [selectedCurrency, setSelectedCurrency] = useState<string>("PEN");

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
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <svg
          className="animate-spin h-8 w-8 text-primary-700"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
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
            <h1 className="font-serif text-4xl text-white">Detalle de Reserva</h1>
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
  const nights = calculateNights(reservation.check_in_date, reservation.check_out_date);
  const isIncomplete = status === "incomplete";
  const isPending = status === "pending";
  const isActive = isIncomplete || isPending;
  const deadlineExpired = isIncomplete && reservation.payment_deadline && countdown.expired;
  const deadlineActive = isIncomplete && reservation.payment_deadline && !countdown.expired;
  const isUrgent = countdown.total < 10 * 60 * 1000;
  const showPaymentSection = (deadlineActive && !uploaded) || false;

  /* ── Status alert content ── */
  const statusAlert = (() => {
    if (deadlineExpired) {
      return {
        bg: "bg-red-50 border-red-200",
        icon: "text-red-500",
        title: "Plazo expirado",
        text: "El plazo para subir el comprobante ha expirado. Su reserva sera cancelada automaticamente.",
        iconPath: "M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z",
      };
    }
    if (uploaded || isPending) {
      return {
        bg: "bg-blue-50 border-blue-200",
        icon: "text-blue-500",
        title: "Comprobante en revision",
        text: "Estamos validando su deposito. Le notificaremos cuando su reserva sea confirmada.",
        iconPath: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
      };
    }
    if (status === "confirmed") {
      return {
        bg: "bg-green-50 border-green-200",
        icon: "text-green-500",
        title: "Reserva confirmada",
        text: "Su reserva esta confirmada. Le esperamos en las fechas indicadas.",
        iconPath: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      };
    }
    if (status === "check_in") {
      return {
        bg: "bg-green-50 border-green-200",
        icon: "text-green-500",
        title: "Check-in realizado",
        text: "Bienvenido, disfrute su estancia.",
        iconPath: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      };
    }
    if (status === "cancelled") {
      return {
        bg: "bg-red-50 border-red-200",
        icon: "text-red-400",
        title: "Reserva cancelada",
        text: "Esta reserva ha sido cancelada.",
        iconPath: "M6 18L18 6M6 6l12 12",
      };
    }
    if (status === "no_show") {
      return {
        bg: "bg-gray-50 border-gray-200",
        icon: "text-gray-400",
        title: "No-show",
        text: "No-show registrado para esta reserva.",
        iconPath: "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z",
      };
    }
    if (status === "check_out") {
      return {
        bg: "bg-gray-50 border-gray-200",
        icon: "text-gray-400",
        title: "Check-out completado",
        text: "Gracias por su visita.",
        iconPath: "M4.5 12.75l6 6 9-13.5",
      };
    }
    return null;
  })();

  return (
    <div className="min-h-screen bg-sand-50">
      {/* ── Content ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Volver */}
        <Link
          href="/mis-reservas"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-900 text-sm font-sans mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a Mis Reservas
        </Link>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg font-sans text-sm mb-6">
            {error}
          </div>
        )}

        {/* ── Mobile: Estado de la Reserva (arriba) ── */}
        <div className="lg:hidden mb-6 space-y-4">
          {/* Timer prominente */}
          {deadlineActive && (
            <div className={`rounded-lg p-4 border ${isUrgent ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
              <div className="flex items-center gap-3">
                <svg className={`w-5 h-5 shrink-0 ${isUrgent ? "text-red-500" : "text-amber-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className={`font-sans font-semibold text-xs ${isUrgent ? "text-red-700" : "text-amber-700"}`}>
                    Tiempo restante para enviar comprobante
                  </p>
                  <p className={`font-mono text-2xl font-bold ${isUrgent ? "text-red-600" : "text-amber-600"}`}>
                    {String(countdown.minutes).padStart(2, "0")}:{String(countdown.seconds).padStart(2, "0")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Status alert */}
          {statusAlert && !deadlineActive && (
            <div className={`rounded-lg p-4 border ${statusAlert.bg}`}>
              <div className="flex items-center gap-3">
                <svg className={`w-5 h-5 shrink-0 ${statusAlert.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={statusAlert.iconPath} />
                </svg>
                <div>
                  <p className="font-sans font-semibold text-sm text-gray-800">{statusAlert.title}</p>
                  <p className="text-sm text-gray-600">{statusAlert.text}</p>
                </div>
              </div>
            </div>
          )}

          {/* Voucher subido – mobile */}
          {uploaded && reservation.voucher_image && (
            <div className="border border-green-200 bg-green-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-green-800 mb-2">Comprobante enviado</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={reservation.voucher_image} alt="Voucher" className="w-full max-h-48 object-contain rounded" />
            </div>
          )}

          {/* Upload voucher – mobile */}
          {showPaymentSection && !uploaded && (
            <div className="bg-white rounded-lg border border-sand-200 p-4">
              <h3 className="font-sans font-semibold text-sm text-primary-900 mb-3">Subir comprobante</h3>
              {!preview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-sand-300 rounded-lg p-6 text-center cursor-pointer hover:border-accent-400 hover:bg-sand-50 transition-colors"
                >
                  <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <p className="text-gray-500 font-sans text-xs">Seleccionar imagen (JPEG, PNG, WebP)</p>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative rounded-lg overflow-hidden border border-sand-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="Preview" className="w-full max-h-48 object-contain bg-sand-50" />
                    <button
                      onClick={() => { setFile(null); setPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-sm"
                    >
                      <svg className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-500">{file?.name}</p>
                </div>
              )}
              <button onClick={handleUpload} disabled={!file || uploading} className="btn-primary w-full !py-3 mt-3 disabled:opacity-50 text-sm">
                {uploading ? "Subiendo..." : "Enviar Comprobante"}
              </button>
            </div>
          )}
        </div>

        {/* ── Grid: 2/3 + 1/3 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Main column (2/3) ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* CARD 1: Detalles de la Reserva */}
            <div className="bg-white rounded-lg border border-sand-200 shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-serif text-lg text-primary-900">Detalles de la Reserva</h2>
                  <span className="font-mono text-sm font-semibold text-primary-700 bg-primary-50 px-3 py-1 rounded">
                    {reservation.confirmation_code}
                  </span>
                </div>

                {/* Grid de informacion al estilo Casa Austin */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-sand-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs text-gray-400 font-sans uppercase tracking-wider">Check-in</span>
                    </div>
                    <p className="font-medium text-primary-900 text-sm">{formatDate(reservation.check_in_date)}</p>
                  </div>
                  <div className="bg-sand-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs text-gray-400 font-sans uppercase tracking-wider">Check-out</span>
                    </div>
                    <p className="font-medium text-primary-900 text-sm">{formatDate(reservation.check_out_date)}</p>
                  </div>
                  <div className="bg-sand-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                      <span className="text-xs text-gray-400 font-sans uppercase tracking-wider">Huesped</span>
                    </div>
                    <p className="font-medium text-primary-900 text-sm">{reservation.guest_name}</p>
                  </div>
                  <div className="bg-sand-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                      </svg>
                      <span className="text-xs text-gray-400 font-sans uppercase tracking-wider">Noches</span>
                    </div>
                    <p className="font-medium text-primary-900 text-sm">{nights} {nights === 1 ? "noche" : "noches"}</p>
                  </div>
                </div>

                {/* Habitacion */}
                <div className="mt-4 pt-4 border-t border-sand-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-sans uppercase tracking-wider">Habitacion</p>
                      <p className="font-semibold text-primary-900">{reservation.room_type}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: Informacion de Pago – solo si hay bank accounts y (deadline activo o uploaded) */}
            {(showPaymentSection || uploaded) && (
              <div className="bg-white rounded-lg border border-sand-200 shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="font-serif text-lg text-primary-900">Informacion de Pago</h2>
                  </div>

                  {/* Total */}
                  <div className="bg-sand-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 font-sans">Total de la reserva</span>
                      <span className="font-serif text-2xl font-bold text-primary-900">
                        {reservation.currency} {reservation.total_amount}
                      </span>
                    </div>
                  </div>

                  {/* Importante: depositar */}
                  {showPaymentSection && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                      <p className="text-sm text-blue-700 font-sans">
                        <span className="font-semibold">Importante:</span> Para confirmar la reserva
                        debe realizar la transferencia y subir el comprobante dentro del plazo indicado.
                      </p>
                    </div>
                  )}

                  {/* Bank accounts con tabs por moneda */}
                  {showPaymentSection && bankAccounts.length > 0 && (() => {
                    const currencies = [...new Set(bankAccounts.map((a) => a.currency))];
                    const filtered = bankAccounts.filter((a) => a.currency === selectedCurrency);
                    return (
                      <div className="mb-6">
                        <h3 className="font-sans font-semibold text-sm text-primary-900 mb-3">
                          Datos para la transferencia
                        </h3>

                        {/* Tabs de moneda */}
                        {currencies.length > 1 && (
                          <div className="flex rounded-lg bg-sand-100 p-1 mb-4">
                            {currencies.map((cur) => (
                              <button
                                key={cur}
                                onClick={() => setSelectedCurrency(cur)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-sm font-semibold transition-all ${
                                  selectedCurrency === cur
                                    ? "bg-white text-primary-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                }`}
                              >
                                <span className={`font-bold ${
                                  cur === "PEN" ? "text-green-600" : "text-blue-600"
                                }`}>
                                  {cur === "PEN" ? "S/" : "$"}
                                </span>
                                {cur === "PEN" ? "Soles" : "Dolares"}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Cuentas de la moneda seleccionada */}
                        <div className="space-y-3">
                          {filtered.map((account) => (
                            <div key={account.id} className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                              <h4 className="font-sans font-semibold text-sm text-gray-900 mb-3">
                                {account.bank_name}
                              </h4>
                              <div className="space-y-2.5 text-sm font-sans">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="text-gray-500 text-xs block">Titular</span>
                                    <span className="font-medium text-gray-900">{account.account_holder}</span>
                                  </div>
                                  <CopyButton text={account.account_holder} />
                                </div>
                                <div className="border-t border-amber-200/60 pt-2 flex items-center justify-between">
                                  <div>
                                    <span className="text-gray-500 text-xs block">N° de cuenta</span>
                                    <span className="font-medium font-mono text-gray-900">{account.account_number}</span>
                                  </div>
                                  <CopyButton text={account.account_number} />
                                </div>
                                {account.cci && (
                                  <div className="border-t border-amber-200/60 pt-2 flex items-center justify-between">
                                    <div>
                                      <span className="text-gray-500 text-xs block">CCI (transferencia interbancaria)</span>
                                      <span className="font-medium font-mono text-gray-900">{account.cci}</span>
                                    </div>
                                    <CopyButton text={account.cci} />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                          {filtered.length === 0 && (
                            <p className="text-sm text-gray-500 font-sans py-4 text-center">
                              No hay cuentas disponibles en esta moneda.
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Voucher upload/preview se muestra en la sidebar */}
                </div>
              </div>
            )}

            {/* Deadline expirado — CTA buscar disponibilidad */}
            {deadlineExpired && (
              <div className="bg-white rounded-lg border border-red-200 shadow-sm p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <h3 className="font-serif text-lg text-red-800 mb-2">Plazo Expirado</h3>
                <p className="text-sm text-gray-500 font-sans mb-4">
                  El plazo para subir el comprobante de pago ha expirado.
                </p>
                <Link href="/disponibilidad" className="btn-primary inline-block">
                  Buscar Nueva Disponibilidad
                </Link>
              </div>
            )}
          </div>

          {/* ── Sidebar (1/3) ── */}
          <div className="space-y-6">

            {/* Card: Estado de la Reserva – Desktop only */}
            <div className="hidden lg:block bg-white rounded-lg border border-sand-200 shadow-sm p-6">
              <h3 className="font-sans font-semibold text-sm text-primary-900 mb-4">Estado de la Reserva</h3>

              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-4 ${STATUS_COLORS[status] || "bg-gray-100 text-gray-800"}`}>
                {STATUS_LABELS[status] || status}
              </span>

              {/* Timer */}
              {deadlineActive && (
                <div className={`rounded-lg p-3 border mb-4 ${isUrgent ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
                  <div className="flex items-center gap-2">
                    <svg className={`w-4 h-4 shrink-0 ${isUrgent ? "text-red-500" : "text-amber-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className={`text-[10px] uppercase tracking-wider font-semibold ${isUrgent ? "text-red-600" : "text-amber-600"}`}>
                        Tiempo restante
                      </p>
                      <p className={`font-mono text-xl font-bold ${isUrgent ? "text-red-600" : "text-amber-600"}`}>
                        {String(countdown.minutes).padStart(2, "0")}:{String(countdown.seconds).padStart(2, "0")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Status alert */}
              {statusAlert && (
                <div className={`rounded-lg p-3 border ${statusAlert.bg}`}>
                  <div className="flex items-start gap-2">
                    <svg className={`w-4 h-4 shrink-0 mt-0.5 ${statusAlert.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={statusAlert.iconPath} />
                    </svg>
                    <div>
                      <p className="font-sans font-semibold text-xs text-gray-800">{statusAlert.title}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{statusAlert.text}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Voucher subido – sidebar */}
              {uploaded && reservation.voucher_image && (
                <div className="mt-4 border border-green-200 bg-green-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-green-800 mb-2">Comprobante enviado</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={reservation.voucher_image} alt="Voucher" className="w-full max-h-48 object-contain rounded" />
                </div>
              )}

              {/* Upload voucher – sidebar */}
              {showPaymentSection && !uploaded && (
                <div className="mt-4">
                  <h4 className="font-sans font-semibold text-xs text-primary-900 mb-2">Subir comprobante</h4>
                  {!preview ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-sand-300 rounded-lg p-5 text-center cursor-pointer hover:border-accent-400 hover:bg-sand-50 transition-colors"
                    >
                      <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      <p className="text-gray-500 font-sans text-xs">Seleccionar imagen</p>
                      <p className="text-gray-400 font-sans text-[10px]">JPEG, PNG, WebP — Max 5 MB</p>
                      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative rounded-lg overflow-hidden border border-sand-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={preview} alt="Preview" className="w-full max-h-48 object-contain bg-sand-50" />
                        <button
                          onClick={() => { setFile(null); setPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                          className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-sm"
                        >
                          <svg className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-500">{file?.name}</p>
                    </div>
                  )}
                  <button onClick={handleUpload} disabled={!file || uploading} className="btn-primary w-full !py-2.5 mt-3 disabled:opacity-50 text-sm">
                    {uploading ? "Subiendo..." : "Enviar Comprobante"}
                  </button>
                </div>
              )}
            </div>

            {/* Card: Resumen de costos */}
            <div className="bg-white rounded-lg border border-sand-200 shadow-sm p-6">
              <h3 className="font-sans font-semibold text-sm text-primary-900 mb-4">Resumen</h3>
              <div className="space-y-2 text-sm font-sans">
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">Habitacion</span>
                  <span className="text-primary-800 font-medium">{reservation.room_type}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">Fechas</span>
                  <span className="text-primary-800 font-medium text-right">
                    {formatDateShort(reservation.check_in_date)} — {formatDateShort(reservation.check_out_date)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">Noches</span>
                  <span className="text-primary-800 font-medium">{nights}</span>
                </div>
                <div className="border-t border-sand-100 mt-2 pt-3 flex justify-between">
                  <span className="font-semibold text-primary-900">Total</span>
                  <span className="font-serif text-xl font-bold text-primary-900">
                    {reservation.currency} {reservation.total_amount}
                  </span>
                </div>
              </div>
            </div>

            {/* Card: Cancelar reserva */}
            {isActive && !deadlineExpired && (
              <div className="bg-white rounded-lg border border-sand-200 shadow-sm p-6">
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
