"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getBankAccounts, lookupReservation, uploadVoucher } from "@/lib/api";
import type { BankAccount, ReservationLookup } from "@/lib/types";

function useCountdown(deadline: string | null) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!deadline) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  if (!deadline) return { minutes: 0, seconds: 0, expired: false, total: 0 };

  const diff = Math.max(0, new Date(deadline).getTime() - now);
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return { minutes, seconds, expired: diff === 0, total: diff };
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

interface Props {
  slug: string;
}

export default function PaymentClient({ slug }: Props) {
  const searchParams = useSearchParams();
  const code = searchParams.get("code") || "";

  const [reservation, setReservation] = useState<ReservationLookup | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const countdown = useCountdown(reservation?.payment_deadline ?? null);

  const loadData = useCallback(async () => {
    if (!code) {
      setLoading(false);
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
      setError("No se pudo cargar la informacion de la reserva.");
    } finally {
      setLoading(false);
    }
  }, [slug, code]);

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
    if (!file || !code) return;
    setUploading(true);
    setError(null);
    try {
      await uploadVoucher(slug, code, file);
      setUploaded(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al subir el comprobante."
      );
    } finally {
      setUploading(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <svg
          className="animate-spin h-8 w-8 text-accent-500"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  // No code or reservation
  if (!code || !reservation) {
    return (
      <div>
        <div className="bg-primary-900 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-serif text-4xl text-white">Pago de Reserva</h1>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <p className="text-gray-500 font-sans mb-6">
            {error || "No se encontro la reserva solicitada."}
          </p>
          <Link href="/" className="btn-primary">
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  // Success state after upload
  if (uploaded) {
    return (
      <div>
        <div className="bg-primary-900 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-accent-400 text-sm uppercase tracking-[0.3em] font-sans font-medium mb-4">
              Comprobante enviado
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl text-white">
              Comprobante Recibido
            </h1>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-16">
          <div className="bg-white rounded-lg shadow-sm border border-sand-200 p-8">
            <p className="text-gray-500 font-sans text-center mb-8">
              Su comprobante de pago ha sido recibido. El hotel revisara su pago y
              confirmara su reserva en breve.
            </p>
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-sand-100">
                <span className="text-sm text-gray-400 font-sans uppercase tracking-wider">Codigo</span>
                <span className="font-serif text-xl text-primary-900 font-semibold">{reservation.confirmation_code}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-sand-100">
                <span className="text-sm text-gray-400 font-sans uppercase tracking-wider">Total</span>
                <span className="font-serif text-xl text-primary-900 font-semibold">
                  {reservation.currency} {reservation.total_amount}
                </span>
              </div>
            </div>
            <div className="text-center mt-8">
              <Link href="/" className="btn-dark">Volver al Inicio</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Expired deadline
  if (countdown.expired && reservation.payment_deadline) {
    return (
      <div>
        <div className="bg-primary-900 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl text-white">
              Plazo Expirado
            </h1>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-16">
          <div className="bg-white rounded-lg shadow-sm border border-sand-200 p-8 text-center">
            <p className="text-gray-500 font-sans mb-6">
              El plazo para subir el comprobante de pago ha expirado.
              Su reserva ha sido cancelada automaticamente.
            </p>
            <Link href="/disponibilidad" className="btn-primary">
              Buscar Nueva Disponibilidad
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isUrgent = countdown.total < 10 * 60 * 1000; // less than 10 min

  return (
    <div>
      {/* Header */}
      <div className="bg-primary-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-accent-400 text-sm uppercase tracking-[0.3em] font-sans font-medium mb-3">
            Paso final
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-white">
            Pago por Transferencia
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg font-sans text-sm">
                {error}
              </div>
            )}

            {/* Countdown */}
            {reservation.payment_deadline && (
              <div className={`rounded-lg p-6 border ${
                isUrgent
                  ? "bg-red-50 border-red-200"
                  : "bg-amber-50 border-amber-200"
              }`}>
                <div className="flex items-center gap-3">
                  <svg className={`w-6 h-6 ${isUrgent ? "text-red-500" : "text-amber-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className={`font-sans font-semibold text-sm ${isUrgent ? "text-red-700" : "text-amber-700"}`}>
                      Tiempo restante para enviar comprobante
                    </p>
                    <p className={`font-serif text-3xl font-bold ${isUrgent ? "text-red-600" : "text-amber-600"}`}>
                      {String(countdown.minutes).padStart(2, "0")}:{String(countdown.seconds).padStart(2, "0")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Bank accounts */}
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
                          <span className="text-gray-400 block text-xs uppercase tracking-wider">Titular</span>
                          <span className="text-primary-800 font-medium">{account.account_holder}</span>
                        </div>
                        <CopyButton text={account.account_holder} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-gray-400 block text-xs uppercase tracking-wider">N° de cuenta</span>
                          <span className="text-primary-800 font-medium font-mono">{account.account_number}</span>
                        </div>
                        <CopyButton text={account.account_number} />
                      </div>
                      {account.cci && (
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-gray-400 block text-xs uppercase tracking-wider">CCI</span>
                            <span className="text-primary-800 font-medium font-mono">{account.cci}</span>
                          </div>
                          <CopyButton text={account.cci} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upload zone */}
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
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
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
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full p-2 shadow-sm transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 font-sans">
                    {file?.name} — {((file?.size ?? 0) / 1024 / 1024).toFixed(2)} MB
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
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Subiendo...
                  </span>
                ) : (
                  "Enviar Comprobante"
                )}
              </button>
            </div>
          </div>

          {/* Sidebar - Reservation summary */}
          <div>
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
                  <span className="text-gray-400">Check-in</span>
                  <span className="text-primary-800 font-medium">
                    {reservation.check_in_date}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-sand-100">
                  <span className="text-gray-400">Check-out</span>
                  <span className="text-primary-800 font-medium">
                    {reservation.check_out_date}
                  </span>
                </div>
                <div className="flex justify-between py-4 bg-sand-50 -mx-8 px-8 rounded-b-lg mt-4">
                  <span className="text-sm font-semibold text-primary-700 font-sans uppercase tracking-wider">
                    Total a transferir
                  </span>
                  <span className="font-serif text-2xl text-primary-900 font-semibold">
                    {reservation.currency} {reservation.total_amount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
