"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { guestLogin, guestRegister } from "@/lib/api";
import { setGuestSession } from "@/lib/guest-auth";
import { COUNTRY_PHONE_CODES, getDialCode } from "@/lib/phone-codes";

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

type Tab = "login" | "register";

export default function LoginClient({ slug, defaultCountry = "PE" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || `/${slug}/mis-reservas`;

  const [tab, setTab] = useState<Tab>("login");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Login fields
  const [loginDocType, setLoginDocType] = useState("");
  const [loginDocNumber, setLoginDocNumber] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCountry, setPhoneCountry] = useState(defaultCountry);
  const [phone, setPhone] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [nationality, setNationality] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const session = await guestLogin(slug, loginDocType, loginDocNumber, loginPassword);
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
        document_type: documentType,
        document_number: documentNumber,
        nationality,
        password,
      });
      setGuestSession(session);
      router.push(nextUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
    } finally {
      setSubmitting(false);
    }
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
            {tab === "login" ? "Iniciar Sesion" : "Crear Cuenta"}
          </h1>
          <p className="text-white/70 text-lg">
            {tab === "login"
              ? "Ingrese con su documento y contraseña"
              : "Complete sus datos para crear su cuenta"}
          </p>
        </div>
      </section>

      <section className="py-12 bg-sand-50 min-h-[60vh]">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-lg border border-sand-200 p-8">
            {/* Tabs */}
            <div className="flex border-b border-sand-200 mb-6">
              <button
                onClick={() => { setTab("login"); setError(null); }}
                className={`pb-3 px-4 text-sm font-sans font-medium border-b-2 transition-colors flex-1 ${tab === "login" ? "border-accent-500 text-primary-900" : "border-transparent text-gray-400 hover:text-gray-600"}`}
              >
                Iniciar sesion
              </button>
              <button
                onClick={() => { setTab("register"); setError(null); }}
                className={`pb-3 px-4 text-sm font-sans font-medium border-b-2 transition-colors flex-1 ${tab === "register" ? "border-accent-500 text-primary-900" : "border-transparent text-gray-400 hover:text-gray-600"}`}
              >
                Crear cuenta
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm mb-5">
                {error}
              </div>
            )}

            {/* LOGIN TAB */}
            {tab === "login" && (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="label-field">Tipo de documento</label>
                  <select
                    value={loginDocType}
                    onChange={(e) => setLoginDocType(e.target.value)}
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
                    value={loginDocNumber}
                    onChange={(e) => setLoginDocNumber(e.target.value)}
                    required
                    placeholder="Ej: 12345678"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="label-field">Contraseña</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    placeholder="••••••"
                    className="input-field"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !loginDocType || !loginDocNumber || !loginPassword}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      {spinner} Ingresando...
                    </span>
                  ) : "Ingresar"}
                </button>
              </form>
            )}

            {/* REGISTER TAB */}
            {tab === "register" && (
              <form onSubmit={handleRegister} className="space-y-5">
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-field">Tipo de documento <span className="text-red-400">*</span></label>
                    <select
                      required
                      value={documentType}
                      onChange={(e) => { setDocumentType(e.target.value); if (e.target.value === "dni") setNationality("PE"); }}
                      className="input-field"
                    >
                      <option value="">Seleccionar</option>
                      {DOCUMENT_TYPES.map((dt) => (
                        <option key={dt.value} value={dt.value}>{dt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label-field">N° de documento <span className="text-red-400">*</span></label>
                    <input type="text" required value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} className="input-field" placeholder="12345678" />
                  </div>
                </div>

                <div>
                  <label className="label-field">Nacionalidad <span className="text-red-400">*</span></label>
                  <select required value={nationality} onChange={(e) => setNationality(e.target.value)} className="input-field">
                    <option value="">Seleccionar nacionalidad</option>
                    {NATIONALITIES.map((n) => (
                      <option key={n.value} value={n.value}>{n.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label-field">Contraseña <span className="text-red-400">*</span></label>
                  <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="Minimo 6 caracteres" />
                  <p className="text-xs text-gray-400 mt-1">Para acceder a sus reservas en el futuro</p>
                </div>

                <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-50">
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      {spinner} Registrando...
                    </span>
                  ) : "Crear cuenta"}
                </button>
              </form>
            )}
          </div>

          <div className="text-center mt-6">
            <Link
              href={`/${slug}/disponibilidad`}
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
