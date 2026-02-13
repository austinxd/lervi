"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { guestLogin } from "@/lib/api";
import { setGuestSession } from "@/lib/guest-auth";

interface Props {
  slug: string;
}

const DOCUMENT_TYPES = [
  { value: "dni", label: "DNI" },
  { value: "passport", label: "Pasaporte" },
  { value: "ce", label: "Carnet de Extranjería" },
  { value: "other", label: "Otro" },
];

export default function LoginClient({ slug }: Props) {
  const router = useRouter();
  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const session = await guestLogin(slug, documentType, documentNumber, password);
      setGuestSession(session);
      router.push(`/${slug}/mis-reservas`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se encontró un huésped con ese documento."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="bg-primary-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-4xl text-white mb-3">
            Mis Reservas
          </h1>
          <p className="text-white/70 text-lg">
            Ingrese su documento para consultar sus reservas
          </p>
        </div>
      </section>

      <section className="py-12 bg-sand-50 min-h-[60vh]">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-lg border border-sand-200 p-8">
            <h2 className="section-subtitle mb-6">Iniciar sesión</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label-field">Tipo de documento</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  required
                  className="input-field"
                >
                  <option value="">Seleccionar...</option>
                  {DOCUMENT_TYPES.map((dt) => (
                    <option key={dt.value} value={dt.value}>
                      {dt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-field">Número de documento</label>
                <input
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  required
                  placeholder="Ej: 12345678"
                  className="input-field"
                />
              </div>

              <div>
                <label className="label-field">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••"
                  className="input-field"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !documentType || !documentNumber || !password}
                className="btn-primary w-full"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
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
                    Ingresando...
                  </span>
                ) : (
                  "Ingresar"
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              ¿No tiene cuenta?{" "}
              <Link href={`/${slug}/disponibilidad`} className="text-accent-600 hover:text-accent-700 font-medium">
                Reserve y cree su cuenta
              </Link>
            </p>
          </div>

          <div className="text-center mt-6">
            <Link
              href={`/${slug}/disponibilidad`}
              className="text-sm text-accent-600 hover:text-accent-700 font-medium"
            >
              ¿Aún no tiene reserva? Buscar disponibilidad
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
