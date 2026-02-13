"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createGroupReservation, getGuestProfile } from "@/lib/api";
import { getGuestToken, getGuestName } from "@/lib/guest-auth";
import { COUNTRY_PHONE_CODES, getDialCode } from "@/lib/phone-codes";
import type { GroupReservationConfirmation, GuestProfile } from "@/lib/types";

interface CombinationData {
  rooms: {
    room_type_id: string;
    room_type_name: string;
    cover_photo: string | null;
    quantity: number;
    adults_per_room: number;
    children_per_room: number;
    subtotal: string;
  }[];
  total: string;
  check_in: string;
  check_out: string;
}

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

export default function GroupBookingClient({ slug, defaultCountry = "PE" }: Props) {
  const router = useRouter();
  const [combo, setCombo] = useState<CombinationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] =
    useState<GroupReservationConfirmation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guestName, setGuestName] = useState<string | null>(null);

  // Guest fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCountry, setPhoneCountry] = useState(defaultCountry);
  const [phone, setPhone] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [nationality, setNationality] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  const currentUrl = typeof window !== "undefined"
    ? window.location.pathname + window.location.search
    : "/reservar-grupo";

  const prefillFromProfile = (profile: GuestProfile) => {
    setFirstName(profile.first_name);
    setLastName(profile.last_name);
    setEmail(profile.email);
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

  useEffect(() => {
    // Load combination from sessionStorage
    const stored = sessionStorage.getItem("group_combination");
    if (stored) {
      setCombo(JSON.parse(stored));
    }

    // Auth check + profile prefill
    const token = getGuestToken();
    if (!token) {
      router.replace(`/iniciar-sesion?next=${encodeURIComponent(currentUrl)}`);
      return;
    }

    getGuestProfile(slug, token)
      .then((profile) => {
        prefillFromProfile(profile);
        setGuestName(getGuestName());
      })
      .catch(() => {
        router.replace(`/iniciar-sesion?next=${encodeURIComponent(currentUrl)}`);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!combo) return;
    setSubmitting(true);
    setError(null);
    try {
      const rooms = combo.rooms.flatMap((r) =>
        Array.from({ length: r.quantity }, () => ({
          room_type_id: r.room_type_id,
          adults: r.adults_per_room,
          children: r.children_per_room,
        }))
      );

      const fullPhone = phone ? `${getDialCode(phoneCountry)} ${phone}` : "";
      const result = await createGroupReservation(slug, {
        first_name: firstName,
        last_name: lastName,
        email,
        phone: fullPhone,
        document_type: documentType,
        document_number: documentNumber,
        nationality,
        check_in_date: combo.check_in,
        check_out_date: combo.check_out,
        rooms,
        special_requests: specialRequests,
      });

      sessionStorage.removeItem("group_combination");

      // If bank accounts exist, redirect to first reservation detail for payment
      const firstWithBank = result.reservations.find((r) => r.has_bank_accounts);
      if (firstWithBank) {
        router.push(`/mis-reservas/${firstWithBank.confirmation_code}`);
        return;
      }

      setConfirmation(result);
    } catch {
      setError("No se pudo completar la reserva grupal. Intente nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

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

  // === CONFIRMATION (only when no bank accounts) ===
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
            <p className="text-accent-400 text-sm uppercase tracking-[0.3em] font-sans font-medium mb-4">
              Confirmacion
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl text-white">
              Reserva Grupal Exitosa
            </h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-16">
          <div className="bg-white rounded-lg shadow-sm border border-sand-200 p-8">
            <p className="text-gray-500 font-sans text-center mb-8">
              Su reserva grupal ha sido registrada exitosamente.
            </p>

            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-sand-100">
                <span className="text-sm text-gray-400 font-sans uppercase tracking-wider">
                  Codigo de grupo
                </span>
                <span className="font-serif text-xl text-primary-900 font-semibold">
                  {confirmation.group_code}
                </span>
              </div>

              <div className="py-3 border-b border-sand-100">
                <p className="text-sm text-gray-400 font-sans uppercase tracking-wider mb-3">
                  Reservas individuales
                </p>
                <div className="space-y-2">
                  {confirmation.reservations.map((res) => (
                    <div
                      key={res.confirmation_code}
                      className="flex justify-between items-center bg-sand-50 rounded-lg px-4 py-3"
                    >
                      <div>
                        <p className="font-serif text-sm text-primary-900 font-medium">
                          {res.room_type}
                        </p>
                        <p className="text-xs text-gray-400 font-sans">
                          {res.check_in_date} — {res.check_out_date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm text-accent-600 font-medium">
                          {res.confirmation_code}
                        </p>
                        <p className="text-xs text-gray-400 font-sans">
                          {res.currency} {res.total_amount}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between py-4 bg-sand-50 -mx-8 px-8 rounded-b-lg mt-4">
                <span className="text-sm font-semibold text-primary-700 font-sans uppercase tracking-wider">
                  Total
                </span>
                <span className="font-serif text-2xl text-primary-900 font-semibold">
                  {confirmation.currency} {confirmation.total_amount}
                </span>
              </div>
            </div>

            <div className="flex gap-4 justify-center mt-8">
              <Link href="/mis-reservas" className="btn-primary">Ver mis reservas</Link>
              <Link href="/" className="btn-dark">Volver al Inicio</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === NO COMBINATION DATA ===
  if (!combo) {
    return (
      <div>
        <div className="bg-primary-900 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-serif text-4xl text-white">Reserva Grupal</h1>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-gray-500 font-sans mb-6">
            No se encontro la combinacion seleccionada.
          </p>
          <Link href="/disponibilidad" className="btn-primary">
            Buscar Disponibilidad
          </Link>
        </div>
      </div>
    );
  }

  // === BOOKING FORM ===
  const nights = Math.max(
    0,
    Math.ceil(
      (new Date(combo.check_out).getTime() -
        new Date(combo.check_in).getTime()) /
        86400000
    )
  );

  const totalRooms = combo.rooms.reduce((sum, r) => sum + r.quantity, 0);
  const totalAdults = combo.rooms.reduce((sum, r) => sum + r.adults_per_room * r.quantity, 0);
  const totalChildren = combo.rooms.reduce((sum, r) => sum + r.children_per_room * r.quantity, 0);

  return (
    <div>
      {/* Page Header */}
      <div className="bg-primary-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/disponibilidad"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm font-sans mb-4 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Volver a disponibilidad
          </Link>
          <p className="text-accent-400 text-sm uppercase tracking-[0.3em] font-sans font-medium mb-3">
            Reserva grupal
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-white">
            Completar Reserva de Grupo
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Form */}
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
                      {NATIONALITIES.find((n) => n.value === nationality)?.label || nationality || "\u2014"}
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

              {/* Special requests */}
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

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full !py-4 disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Procesando...
                  </span>
                ) : (
                  "Confirmar Reserva Grupal"
                )}
              </button>
            </form>
          </div>

          {/* Summary Sidebar */}
          <div>
            <div className="bg-white border border-sand-200 rounded-lg p-8 sticky top-28 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary-500 font-sans mb-4">
                Resumen de reserva grupal
              </p>

              <div className="space-y-3 text-sm font-sans mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-400">Check-in</span>
                  <span className="text-primary-800 font-medium">{combo.check_in}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Check-out</span>
                  <span className="text-primary-800 font-medium">{combo.check_out}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Noches</span>
                  <span className="text-primary-800 font-medium">{nights}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Habitaciones</span>
                  <span className="text-primary-800 font-medium">{totalRooms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Huespedes</span>
                  <span className="text-primary-800 font-medium">
                    {totalAdults} adulto(s){totalChildren > 0 && `, ${totalChildren} menor(es)`}
                  </span>
                </div>
              </div>

              <div className="border-t border-sand-100 pt-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 font-sans">
                  Detalle de habitaciones
                </p>
                {combo.rooms.map((room, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 bg-sand-50 rounded-lg p-3"
                  >
                    <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-primary-100">
                      {room.cover_photo ? (
                        <img
                          src={room.cover_photo}
                          alt={room.room_type_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-primary-900 font-medium truncate">
                        {room.quantity > 1 && `${room.quantity}x `}
                        {room.room_type_name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {room.adults_per_room} adulto(s)
                        {room.children_per_room > 0 &&
                          `, ${room.children_per_room} menor(es)`}
                        {room.quantity > 1 && ` por hab.`}
                      </p>
                    </div>
                    <p className="text-xs text-primary-900 font-semibold flex-shrink-0">
                      PEN {room.subtotal}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-sand-100 mt-4 pt-4 flex justify-between items-center">
                <span className="text-sm font-semibold text-primary-700 font-sans uppercase tracking-wider">
                  Total
                </span>
                <span className="font-serif text-2xl text-primary-900 font-semibold">
                  PEN {combo.total}
                </span>
              </div>

              <div className="mt-6 flex items-start gap-2 text-xs text-gray-400 font-sans">
                <svg className="w-4 h-4 text-accent-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                Reserva segura. Se crearan {totalRooms} reservas vinculadas.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
