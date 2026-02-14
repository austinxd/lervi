"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  guestLogin,
  guestRegister,
  guestLookup,
  guestRequestOtp,
  guestActivate,
  guestVerifyEmail,
  guestIdentityData,
} from "@/lib/api";
import { setGuestSession } from "@/lib/guest-auth";
import { COUNTRY_PHONE_CODES, getDialCode } from "@/lib/phone-codes";
import type { GuestLookupResponse } from "@/lib/types";

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
  { value: "GB", label: "Britanica" },
  { value: "JP", label: "Japonesa" },
  { value: "CN", label: "China" },
  { value: "KR", label: "Coreana" },
  { value: "AU", label: "Australiana" },
  { value: "OTHER", label: "Otra" },
];

type Step = "lookup" | "login" | "register" | "verify-email" | "otp" | "activate";

export default function LoginClient({ slug, defaultCountry = "PE" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/mis-reservas";

  const [step, setStep] = useState<Step>("lookup");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Document fields (shared across steps)
  const [docType, setDocType] = useState("");
  const [docNumber, setDocNumber] = useState("");

  // Login field
  const [password, setPassword] = useState("");

  // Register fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCountry, setPhoneCountry] = useState(defaultCountry);
  const [phone, setPhone] = useState("");
  const [nationality, setNationality] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // Email verification
  const [verifyCode, setVerifyCode] = useState("");

  // OTP / Activate fields
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [actFirstName, setActFirstName] = useState("");
  const [actLastName, setActLastName] = useState("");
  const [actEmail, setActEmail] = useState("");
  const [actPhone, setActPhone] = useState("");
  const [actPhoneCountry, setActPhoneCountry] = useState(defaultCountry);
  const [actNationality, setActNationality] = useState("");

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      const result: GuestLookupResponse = await guestLookup(slug, docType, docNumber);
      switch (result.status) {
        case "login":
          setStep("login");
          setInfo("Encontramos una cuenta asociada a este documento.");
          break;
        case "register":
          setStep("register");
          break;
        case "recognized":
          // Fetch identity data to pre-fill activate form
          try {
            const idData = await guestIdentityData(slug, docType, docNumber);
            if (idData.first_name) setActFirstName(idData.first_name);
            if (idData.last_name) setActLastName(idData.last_name);
            if (idData.email) setActEmail(idData.email);
            if (idData.phone) setActPhone(idData.phone);
            if (idData.nationality) setActNationality(idData.nationality);
          } catch { /* proceed without prefill */ }
          setStep("otp");
          setInfo("Encontramos una cuenta asociada a este documento. Verifique su identidad con un codigo enviado a su email.");
          break;
        case "new":
        default:
          setStep("register");
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al buscar cuenta");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const session = await guestLogin(slug, docType, docNumber, password);
      setGuestSession(session);
      router.push(nextUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesion");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const fullPhone = phone ? `${getDialCode(phoneCountry)} ${phone}` : "";
      const session = await guestRegister(slug, {
        first_name: firstName,
        last_name: lastName,
        email,
        phone: fullPhone,
        document_type: docType,
        document_number: docNumber,
        nationality,
        password: regPassword,
      });
      setGuestSession(session);
      if (session.is_verified === false) {
        setStep("verify-email");
        setInfo("Hemos enviado un codigo de verificacion a " + email);
        setError(null);
      } else {
        router.push(nextUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await guestVerifyEmail(slug, docType, docNumber, verifyCode);
      setInfo(null);
      router.push(nextUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al verificar email");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestOtp = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await guestRequestOtp(slug, docType, docNumber);
      setOtpSent(true);
      setInfo("Codigo enviado a su email.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al solicitar codigo");
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      // If phone already has dial code (pre-filled from identity), use as-is
      const fullPhone = actPhone
        ? actPhone.startsWith("+") ? actPhone : `${getDialCode(actPhoneCountry)} ${actPhone}`
        : "";
      const session = await guestActivate(slug, {
        document_type: docType,
        document_number: docNumber,
        code: otpCode,
        first_name: actFirstName,
        last_name: actLastName,
        email: actEmail,
        phone: fullPhone,
        nationality: actNationality,
      });
      setGuestSession(session);
      router.push(nextUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al activar cuenta");
    } finally {
      setSubmitting(false);
    }
  };

  const goBack = () => {
    setStep("lookup");
    setError(null);
    setInfo(null);
    setPassword("");
    setOtpCode("");
  };

  const stepTitle: Record<Step, string> = {
    lookup: "Acceder a mi cuenta",
    login: "Iniciar Sesion",
    register: "Crear Cuenta",
    "verify-email": "Verificar Email",
    otp: "Verificar Identidad",
    activate: "Completar Registro",
  };

  const stepSubtitle: Record<Step, string> = {
    lookup: "Ingrese su documento para continuar",
    login: "Ingrese su contraseña",
    register: "Complete sus datos para crear su cuenta",
    "verify-email": "Ingrese el codigo enviado a su email",
    otp: "Solicite y verifique el codigo enviado a su email",
    activate: "Complete sus datos para activar su cuenta",
  };

  const spinner = (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );

  return (
    <>
      <section className="bg-primary-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-4xl text-white mb-3">
            {stepTitle[step]}
          </h1>
          <p className="text-white/70 text-lg">
            {stepSubtitle[step]}
          </p>
        </div>
      </section>

      <section className="py-12 bg-sand-50 min-h-[60vh]">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-lg border border-sand-200 p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm mb-5">
                {error}
              </div>
            )}

            {info && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-lg p-4 text-sm mb-5">
                {info}
              </div>
            )}

            {/* STEP: LOOKUP */}
            {step === "lookup" && (
              <form onSubmit={handleLookup} className="space-y-5">
                <div>
                  <label className="label-field">Tipo de documento</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    required
                    className="input-field"
                  >
                    <option value="">Seleccionar...</option>
                    {DOCUMENT_TYPES.map((dt) => (
                      <option key={dt.value} value={dt.value}>{dt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label-field">Numero de documento</label>
                  <input
                    type="text"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    required
                    placeholder="Ej: 12345678"
                    className="input-field"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !docType || !docNumber}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      {spinner} Buscando...
                    </span>
                  ) : "Continuar"}
                </button>
              </form>
            )}

            {/* STEP: LOGIN */}
            {step === "login" && (
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="bg-sand-50 rounded-lg p-3 text-sm text-gray-600">
                  <span className="font-medium">{DOCUMENT_TYPES.find(d => d.value === docType)?.label}:</span> {docNumber}
                </div>

                <div>
                  <label className="label-field">Contraseña</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Ingrese su contraseña"
                    className="input-field"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !password}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      {spinner} Ingresando...
                    </span>
                  ) : "Ingresar"}
                </button>

                <button
                  type="button"
                  onClick={goBack}
                  className="w-full text-sm text-gray-500 hover:text-gray-700"
                >
                  Usar otro documento
                </button>
              </form>
            )}

            {/* STEP: REGISTER */}
            {step === "register" && (
              <form onSubmit={handleRegister} className="space-y-5">
                <div className="bg-sand-50 rounded-lg p-3 text-sm text-gray-600">
                  <span className="font-medium">{DOCUMENT_TYPES.find(d => d.value === docType)?.label}:</span> {docNumber}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-field">Nombre <span className="text-red-400">*</span></label>
                    <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input-field" placeholder="Juan" />
                  </div>
                  <div>
                    <label className="label-field">Apellido <span className="text-red-400">*</span></label>
                    <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} className="input-field" placeholder="Perez" />
                  </div>
                </div>

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
                        <option key={c.code} value={c.code}>{c.flag} {c.dial}</option>
                      ))}
                    </select>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field flex-1" placeholder="999 999 999" />
                  </div>
                </div>

                <div>
                  <label className="label-field">Nacionalidad <span className="text-red-400">*</span></label>
                  <select
                    required
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Seleccionar nacionalidad</option>
                    {NATIONALITIES.map((n) => (
                      <option key={n.value} value={n.value}>{n.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label-field">Contraseña <span className="text-red-400">*</span></label>
                  <input type="password" required minLength={6} value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className="input-field" placeholder="Minimo 6 caracteres" />
                  <p className="text-xs text-gray-400 mt-1">Para acceder a sus reservas en el futuro</p>
                </div>

                <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-50">
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      {spinner} Registrando...
                    </span>
                  ) : "Crear cuenta"}
                </button>

                <button
                  type="button"
                  onClick={goBack}
                  className="w-full text-sm text-gray-500 hover:text-gray-700"
                >
                  Usar otro documento
                </button>
              </form>
            )}

            {/* STEP: VERIFY EMAIL (after registration) */}
            {step === "verify-email" && (
              <form onSubmit={handleVerifyEmail} className="space-y-5">
                <div>
                  <label className="label-field">Codigo de verificacion</label>
                  <input
                    type="text"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="input-field text-center text-2xl tracking-[0.3em]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || verifyCode.length !== 6}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      {spinner} Verificando...
                    </span>
                  ) : "Verificar email"}
                </button>

                <button
                  type="button"
                  onClick={() => router.push(nextUrl)}
                  className="w-full text-sm text-gray-500 hover:text-gray-700"
                >
                  Verificar despues
                </button>
              </form>
            )}

            {/* STEP: OTP (request code) */}
            {step === "otp" && (
              <div className="space-y-5">
                <div className="bg-sand-50 rounded-lg p-3 text-sm text-gray-600">
                  <span className="font-medium">{DOCUMENT_TYPES.find(d => d.value === docType)?.label}:</span> {docNumber}
                </div>

                {!otpSent ? (
                  <>
                    <p className="text-sm text-gray-600">
                      Solicite un codigo de verificacion. Lo enviaremos al email asociado a su cuenta.
                    </p>

                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      disabled={submitting}
                      className="btn-primary w-full disabled:opacity-50"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          {spinner} Enviando...
                        </span>
                      ) : "Enviar codigo"}
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="label-field">Codigo de verificacion</label>
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="000000"
                        maxLength={6}
                        autoFocus
                        className="input-field text-center text-2xl tracking-[0.3em]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => { setStep("activate"); setError(null); setInfo(null); }}
                      disabled={otpCode.length !== 6}
                      className="btn-primary w-full disabled:opacity-50"
                    >
                      Verificar codigo
                    </button>

                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      disabled={submitting}
                      className="w-full text-sm text-accent-600 hover:text-accent-700"
                    >
                      {submitting ? "Reenviando..." : "Reenviar codigo"}
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={goBack}
                  className="w-full text-sm text-gray-500 hover:text-gray-700"
                >
                  Usar otro documento
                </button>
              </div>
            )}

            {/* STEP: ACTIVATE (complete profile after OTP) */}
            {step === "activate" && (
              <form onSubmit={handleActivate} className="space-y-5">
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 text-sm space-y-2">
                  <p className="font-medium">Identidad verificada</p>
                  <p>Reconocimos su cuenta. Sus datos seran los mismos que en su cuenta existente.</p>
                </div>

                <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-50">
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      {spinner} Activando...
                    </span>
                  ) : "Activar mi cuenta en este hotel"}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep("otp"); setError(null); }}
                  className="w-full text-sm text-gray-500 hover:text-gray-700"
                >
                  Volver
                </button>
              </form>
            )}
          </div>

          <div className="text-center mt-6">
            <Link
              href="/disponibilidad"
              className="text-sm text-accent-600 hover:text-accent-700 font-medium"
            >
              Buscar disponibilidad
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
