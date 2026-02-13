"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  searchAvailability,
  createReservation,
  guestRegister,
  guestLogin,
  getGuestProfile,
} from "@/lib/api";
import { getGuestToken, getGuestName, setGuestSession } from "@/lib/guest-auth";
import { COUNTRY_PHONE_CODES, getDialCode } from "@/lib/phone-codes";
import PriceBreakdown from "@/components/PriceBreakdown";
import type {
  AvailabilityResult,
  GuestProfile,
  ReservationConfirmation,
} from "@/lib/types";

interface Props {
  slug: string;
  defaultCountry?: string;
}

const DOCUMENT_TYPES = [
  { value: "dni", label: "DNI" },
  { value: "passport", label: "Pasaporte" },
  { value: "ce", label: "Carnet de Extranjeria" },
  { value: "other", label: "Otro" },
];

const NATIONALITIES = [
  { value: "PE", label: "Peruana" },
  { value: "CO", label: "Colombiana" },
  { value: "EC", label: "Ecuatoriana" },
  { value: "BO", label: "Boliviana" },
  { value: "CL", label: "Chilena" },
  { value: "AR", label: "Argentina" },
  { value: "BR", label: "Brasileña" },
  { value: "MX", label: "Mexicana" },
  { value: "VE", label: "Venezolana" },
  { value: "US", label: "Estadounidense" },
  { value: "CA", label: "Canadiense" },
  { value: "ES", label: "Española" },
  { value: "FR", label: "Francesa" },
  { value: "DE", label: "Alemana" },
  { value: "IT", label: "Italiana" },
  { value: "GB", label: "Británica" },
  { value: "JP", label: "Japonesa" },
  { value: "CN", label: "China" },
  { value: "KR", label: "Coreana" },
  { value: "AU", label: "Australiana" },
  { value: "OTHER", label: "Otra" },
];

type Step = "auth" | "form";
type AuthTab = "login" | "register";

export default function BookingClient({ slug, defaultCountry = "PE" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomTypeId = searchParams.get("room_type") || "";
  const checkIn = searchParams.get("check_in") || "";
  const checkOut = searchParams.get("check_out") || "";
  const adults = Number(searchParams.get("adults") || 1);
  const children = Number(searchParams.get("children") || 0);

  const [availability, setAvailability] = useState<AvailabilityResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<ReservationConfirmation | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auth state
  const [step, setStep] = useState<Step>("auth");
  const [authTab, setAuthTab] = useState<AuthTab>("register");
  const [guestName, setGuestName] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Login fields
  const [loginDocType, setLoginDocType] = useState("");
  const [loginDocNumber, setLoginDocNumber] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Form fields (used for both register and booking)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCountry, setPhoneCountry] = useState(defaultCountry);
  const [phone, setPhone] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [nationality, setNationality] = useState("");
  const [password, setPassword] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  // Check availability on mount
  useEffect(() => {
    if (roomTypeId && checkIn && checkOut) {
      searchAvailability(slug, checkIn, checkOut, adults, children)
        .then((data) => {
          const match = data.results.find((r) => r.room_type.id === roomTypeId);
          setAvailability(match || null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [slug, roomTypeId, checkIn, checkOut, adults, children]);

  // Check if guest is already logged in
  useEffect(() => {
    const token = getGuestToken();
    if (token) {
      getGuestProfile(slug, token)
        .then((profile) => {
          prefillFromProfile(profile);
          setGuestName(getGuestName());
          setStep("form");
        })
        .catch(() => {
          // Token expired or invalid, stay on auth
        });
    }
  }, [slug]);

  const prefillFromProfile = (profile: GuestProfile) => {
    setFirstName(profile.first_name);
    setLastName(profile.last_name);
    setEmail(profile.email);
    // Parse phone: if it starts with a known dial code, split it
    if (profile.phone) {
      const match = COUNTRY_PHONE_CODES.find((c) => profile.phone.startsWith(c.dial));
      if (match) {
        setPhoneCountry(match.code);
        setPhone(profile.phone.slice(match.dial.length).trim());
      } else {
        setPhone(profile.phone);
      }
    }
    setDocumentType(profile.document_type);
    setDocumentNumber(profile.document_number);
    setNationality(profile.nationality);
  };

  // Handle registration (creates account + moves to booking form)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSubmitting(true);
    try {
      const fullPhone = phone ? `${getDialCode(phoneCountry)} ${phone}` : "";
      const session = await guestRegister(slug, {
        first_name: firstName,
        last_name: lastName,
        email,
        phone: fullPhone,
        document_type: documentType,
        document_number: documentNumber,
        nationality,
        password,
      });
      setGuestSession(session);
      setGuestName(session.guest_name);
      setStep("form");
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Error al registrarse");
    } finally {
      setAuthSubmitting(false);
    }
  };

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSubmitting(true);
    try {
      const session = await guestLogin(slug, loginDocType, loginDocNumber, loginPassword);
      setGuestSession(session);
      setGuestName(session.guest_name);
      // Fetch profile to pre-fill
      const token = session.access;
      const profile = await getGuestProfile(slug, token);
      prefillFromProfile(profile);
      setStep("form");
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setAuthSubmitting(false);
    }
  };

  // Handle reservation submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const fullPhone = phone ? `${getDialCode(phoneCountry)} ${phone}` : "";
      const result = await createReservation(slug, {
        first_name: firstName,
        last_name: lastName,
        email,
        phone: fullPhone,
        document_type: documentType,
        document_number: documentNumber,
        nationality,
        room_type_id: roomTypeId,
        check_in_date: checkIn,
        check_out_date: checkOut,
        adults,
        children,
        special_requests: specialRequests,
      });
      if (result.has_bank_accounts) {
        router.push(`/${slug}/reservar/pago?code=${result.confirmation_code}`);
        return;
      }
      setConfirmation(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo completar la reserva.");
    } finally {
      setSubmitting(false);
    }
  };

  // === CONFIRMATION VIEW ===
  if (confirmation) {
    return (
      <div>
        <div className="bg-primary-900 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-accent-400 text-sm uppercase tracking-[0.3em] font-sans font-medium mb-4">Confirmacion</p>
            <h1 className="font-serif text-4xl sm:text-5xl text-white">Reserva Exitosa</h1>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-16">
          <div className="bg-white rounded-lg shadow-sm border border-sand-200 p-8">
            <p className="text-gray-500 font-sans text-center mb-8">
              Su reserva ha sido registrada exitosamente. Recibira un email de confirmacion.
            </p>
            <div className="space-y-4">
              {[
                ["Codigo", confirmation.confirmation_code, "font-serif text-xl font-semibold"],
                ["Huesped", confirmation.guest_name, ""],
                ["Habitacion", confirmation.room_type, ""],
                ["Check-in", confirmation.check_in_date, ""],
                ["Check-out", confirmation.check_out_date, ""],
              ].map(([label, value, extra]) => (
                <div key={label} className="flex justify-between py-3 border-b border-sand-100">
                  <span className="text-sm text-gray-400 font-sans uppercase tracking-wider">{label}</span>
                  <span className={`text-primary-800 font-sans font-medium ${extra}`}>{value}</span>
                </div>
              ))}
              <div className="flex justify-between py-4 bg-sand-50 -mx-8 px-8 rounded-b-lg mt-4">
                <span className="text-sm font-semibold text-primary-700 font-sans uppercase tracking-wider">Total</span>
                <span className="font-serif text-2xl text-primary-900 font-semibold">
                  {confirmation.currency} {confirmation.total_amount}
                </span>
              </div>
            </div>
            <div className="text-center mt-8">
              <Link href={`/${slug}`} className="btn-dark">Volver al Inicio</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === LOADING ===
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <svg className="animate-spin h-8 w-8 text-accent-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  // === NO AVAILABILITY ===
  if (!availability) {
    return (
      <div>
        <div className="bg-primary-900 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-serif text-4xl text-white">Completar Reserva</h1>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <p className="text-gray-500 font-sans mb-6">No se encontro disponibilidad para esta seleccion.</p>
          <Link href={`/${slug}/disponibilidad`} className="btn-primary">Buscar Nuevamente</Link>
        </div>
      </div>
    );
  }

  // === SIDEBAR (shared between auth and form steps) ===
  const sidebar = (
    <div>
      <div className="bg-white border border-sand-200 rounded-lg p-8 sticky top-28 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-500 font-sans mb-4">Resumen de reserva</p>
        <h3 className="font-serif text-xl text-primary-900 mb-6">{availability.room_type.name}</h3>
        <div className="space-y-3 text-sm font-sans mb-6">
          <div className="flex justify-between">
            <span className="text-gray-400">Check-in</span>
            <span className="text-primary-800 font-medium">{checkIn}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Check-out</span>
            <span className="text-primary-800 font-medium">{checkOut}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Huespedes</span>
            <span className="text-primary-800 font-medium">
              {adults} adulto(s){children > 0 && `, ${children} menor(es)`}
            </span>
          </div>
        </div>
        <PriceBreakdown nightlyPrices={availability.nightly_prices} total={availability.total} currency="PEN" />
        <div className="mt-6 flex items-start gap-2 text-xs text-gray-400 font-sans">
          <svg className="w-4 h-4 text-accent-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          Reserva segura. No se realizara ningun cobro hasta su llegada.
        </div>
      </div>
    </div>
  );

  // === AUTH STEP ===
  if (step === "auth") {
    return (
      <div>
        <div className="bg-primary-900 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href={`/${slug}/disponibilidad`}
              className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm font-sans mb-4 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Volver a disponibilidad
            </Link>
            <p className="text-accent-400 text-sm uppercase tracking-[0.3em] font-sans font-medium mb-3">Paso 1</p>
            <h1 className="font-serif text-3xl sm:text-4xl text-white">Identificacion</h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              {/* Tabs */}
              <div className="flex border-b border-sand-200 mb-8">
                <button
                  onClick={() => { setAuthTab("register"); setAuthError(null); }}
                  className={`pb-3 px-6 text-sm font-sans font-medium border-b-2 transition-colors ${authTab === "register" ? "border-accent-500 text-primary-900" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                >
                  Crear cuenta
                </button>
                <button
                  onClick={() => { setAuthTab("login"); setAuthError(null); }}
                  className={`pb-3 px-6 text-sm font-sans font-medium border-b-2 transition-colors ${authTab === "login" ? "border-accent-500 text-primary-900" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                >
                  Ya tengo cuenta
                </button>
              </div>

              {authError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6 font-sans text-sm">
                  {authError}
                </div>
              )}

              {/* REGISTER TAB */}
              {authTab === "register" && (
                <form onSubmit={handleRegister} className="space-y-6">
                  <div>
                    <p className="section-subtitle">Informacion personal</p>
                    <h3 className="font-serif text-xl text-primary-900 mb-6">Datos del Huesped</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="label-field">Nombre <span className="text-red-400">*</span></label>
                        <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input-field" placeholder="Juan" />
                      </div>
                      <div>
                        <label className="label-field">Apellido <span className="text-red-400">*</span></label>
                        <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} className="input-field" placeholder="Perez" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="label-field">Email <span className="text-red-400">*</span></label>
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="juan@email.com" />
                    </div>
                    <div>
                      <label className="label-field">Telefono</label>
                      <div className="flex gap-2">
                        <select
                          value={phoneCountry}
                          onChange={(e) => setPhoneCountry(e.target.value)}
                          className="input-field w-[120px] flex-shrink-0"
                        >
                          {COUNTRY_PHONE_CODES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.flag} {c.dial}
                            </option>
                          ))}
                        </select>
                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field flex-1" placeholder="999 999 999" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="label-field">Tipo de documento <span className="text-red-400">*</span></label>
                      <select required value={documentType} onChange={(e) => { setDocumentType(e.target.value); if (e.target.value === "dni") setNationality("PE"); }} className="input-field">
                        <option value="">Seleccionar</option>
                        {DOCUMENT_TYPES.map((dt) => <option key={dt.value} value={dt.value}>{dt.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label-field">Numero de documento <span className="text-red-400">*</span></label>
                      <input type="text" required value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} className="input-field" placeholder="12345678" />
                    </div>
                  </div>

                  <div>
                    <label className="label-field">Nacionalidad <span className="text-red-400">*</span></label>
                    <select required value={nationality} onChange={(e) => setNationality(e.target.value)} className="input-field">
                      <option value="">Seleccionar nacionalidad</option>
                      {NATIONALITIES.map((n) => <option key={n.value} value={n.value}>{n.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="label-field">Crear contraseña <span className="text-red-400">*</span></label>
                    <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="Minimo 6 caracteres" />
                    <p className="text-xs text-gray-400 mt-1">Para acceder a sus reservas en el futuro</p>
                  </div>

                  <button type="submit" disabled={authSubmitting} className="btn-primary w-full !py-4 disabled:opacity-50">
                    {authSubmitting ? (
                      <span className="flex items-center justify-center gap-3">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Registrando...
                      </span>
                    ) : "Crear cuenta y continuar"}
                  </button>
                </form>
              )}

              {/* LOGIN TAB */}
              {authTab === "login" && (
                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <p className="section-subtitle">Acceda con su documento</p>
                    <h3 className="font-serif text-xl text-primary-900 mb-6">Iniciar Sesion</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="label-field">Tipo de documento <span className="text-red-400">*</span></label>
                        <select required value={loginDocType} onChange={(e) => setLoginDocType(e.target.value)} className="input-field">
                          <option value="">Seleccionar</option>
                          {DOCUMENT_TYPES.map((dt) => <option key={dt.value} value={dt.value}>{dt.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="label-field">Numero de documento <span className="text-red-400">*</span></label>
                        <input type="text" required value={loginDocNumber} onChange={(e) => setLoginDocNumber(e.target.value)} className="input-field" placeholder="12345678" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="label-field">Contraseña <span className="text-red-400">*</span></label>
                    <input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="input-field" placeholder="••••••" />
                  </div>

                  <button type="submit" disabled={authSubmitting} className="btn-primary w-full !py-4 disabled:opacity-50">
                    {authSubmitting ? (
                      <span className="flex items-center justify-center gap-3">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Ingresando...
                      </span>
                    ) : "Iniciar sesion y continuar"}
                  </button>
                </form>
              )}
            </div>
            {sidebar}
          </div>
        </div>
      </div>
    );
  }

  // === FORM STEP (authenticated - data pre-filled) ===
  return (
    <div>
      <div className="bg-primary-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={`/${slug}/disponibilidad`}
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm font-sans mb-4 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Volver a disponibilidad
          </Link>
          <p className="text-accent-400 text-sm uppercase tracking-[0.3em] font-sans font-medium mb-3">Paso final</p>
          <h1 className="font-serif text-3xl sm:text-4xl text-white">Confirmar Reserva</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            {/* Welcome banner */}
            <div className="bg-green-50 border border-green-200 rounded-lg px-6 py-4 mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-green-800 font-sans text-sm font-medium">
                  Bienvenido, {guestName || firstName}
                </span>
              </div>
              <span className="text-green-600 text-xs font-sans">Datos cargados</span>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-8 font-sans text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Guest data summary (read-only) */}
              <div>
                <p className="section-subtitle">Sus datos</p>
                <h3 className="font-serif text-xl text-primary-900 mb-6">Datos del Huesped</h3>
                <div className="bg-sand-50 rounded-lg p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-sans">
                  <div>
                    <span className="text-gray-400 text-xs uppercase tracking-wider">Nombre</span>
                    <p className="text-primary-900 font-medium">{firstName} {lastName}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs uppercase tracking-wider">Email</span>
                    <p className="text-primary-900 font-medium">{email}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs uppercase tracking-wider">Documento</span>
                    <p className="text-primary-900 font-medium">
                      {DOCUMENT_TYPES.find((d) => d.value === documentType)?.label || documentType} {documentNumber}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs uppercase tracking-wider">Nacionalidad</span>
                    <p className="text-primary-900 font-medium">
                      {NATIONALITIES.find((n) => n.value === nationality)?.label || nationality || "—"}
                    </p>
                  </div>
                  {phone && (
                    <div>
                      <span className="text-gray-400 text-xs uppercase tracking-wider">Telefono</span>
                      <p className="text-primary-900 font-medium">{getDialCode(phoneCountry)} {phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Special requests (editable) */}
              <div>
                <label className="label-field">Solicitudes especiales</label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={3}
                  className="input-field"
                  placeholder="Cama extra, piso alto, llegada tardia..."
                />
              </div>

              <button type="submit" disabled={submitting} className="btn-primary w-full !py-4 disabled:opacity-50">
                {submitting ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Procesando...
                  </span>
                ) : "Confirmar Reserva"}
              </button>
            </form>
          </div>
          {sidebar}
        </div>
      </div>
    </div>
  );
}
