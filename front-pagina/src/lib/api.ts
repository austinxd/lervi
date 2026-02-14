import type {
  AvailabilityResponse,
  BankAccount,
  GroupReservationConfirmation,
  GroupReservationRequest,
  GuestLookupResponse,
  GuestProfile,
  GuestRegisterRequest,
  GuestReservation,
  GuestSession,
  OrganizationInfo,
  ReservationConfirmation,
  ReservationLookup,
  ReservationRequest,
  RoomType,
  RoomTypeDetail,
} from "./types";

const INTERNAL_API =
  process.env.INTERNAL_API_URL || "http://127.0.0.1:8100/api/v1/public";

/** Server-side fetch helper (uses internal URL). */
async function fetchAPI<T>(slug: string, path: string, init?: RequestInit): Promise<T> {
  const url = `${INTERNAL_API}/${slug}${path}`;
  const res = await fetch(url, { next: { revalidate: 60 }, ...init });
  if (!res.ok) throw new Error(`API ${res.status}: ${url}`);
  return res.json();
}

export async function getOrganizationInfo(slug: string): Promise<OrganizationInfo> {
  return fetchAPI(slug, "/info/");
}

export async function getRoomTypes(slug: string, propertySlug?: string): Promise<RoomType[]> {
  const params = propertySlug ? `?property=${propertySlug}` : "";
  return fetchAPI(slug, `/room-types/${params}`);
}

export async function getRoomTypeDetail(
  slug: string,
  id: string
): Promise<RoomTypeDetail> {
  return fetchAPI(slug, `/room-types/${id}/`);
}

/** Client-side API helpers (use public proxy URL). */
const PUBLIC_API = "/api";

export async function searchAvailability(
  slug: string,
  checkIn: string,
  checkOut: string,
  adults: number,
  children: number,
  propertySlug?: string
): Promise<AvailabilityResponse> {
  const params = new URLSearchParams({
    check_in: checkIn,
    check_out: checkOut,
    adults: String(adults),
    children: String(children),
  });
  if (propertySlug) params.set("property", propertySlug);
  const res = await fetch(`${PUBLIC_API}/${slug}/availability/?${params}`);
  if (!res.ok) throw new Error("Error al buscar disponibilidad");
  return res.json();
}

export async function createReservation(
  slug: string,
  data: ReservationRequest
): Promise<ReservationConfirmation> {
  const res = await fetch(`${PUBLIC_API}/${slug}/reservations/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || Object.values(err || {}).flat().join(". ") || "Error al crear la reserva");
  }
  return res.json();
}

export async function createGroupReservation(
  slug: string,
  data: GroupReservationRequest
): Promise<GroupReservationConfirmation> {
  const res = await fetch(`${PUBLIC_API}/${slug}/reservations/group/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || Object.values(err || {}).flat().join(". ") || "Error al crear la reserva grupal");
  }
  return res.json();
}

export async function getBankAccounts(
  slug: string
): Promise<BankAccount[]> {
  const res = await fetch(`${PUBLIC_API}/${slug}/bank-accounts/`);
  if (!res.ok) throw new Error("Error al obtener cuentas bancarias");
  return res.json();
}

export async function uploadVoucher(
  slug: string,
  confirmationCode: string,
  file: File
): Promise<{ detail: string }> {
  const formData = new FormData();
  formData.append("voucher", file);
  const res = await fetch(
    `${PUBLIC_API}/${slug}/reservations/${confirmationCode}/voucher/`,
    { method: "POST", body: formData }
  );
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail || "Error al subir el comprobante");
  }
  return res.json();
}

export async function lookupReservation(
  slug: string,
  confirmationCode: string
): Promise<ReservationLookup> {
  const res = await fetch(
    `${PUBLIC_API}/${slug}/reservations/${confirmationCode}/`
  );
  if (!res.ok) throw new Error("Reserva no encontrada");
  return res.json();
}

export async function guestRegister(
  slug: string,
  data: GuestRegisterRequest
): Promise<GuestSession> {
  const res = await fetch(`${PUBLIC_API}/${slug}/guest-register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Error al registrarse");
  }
  return res.json();
}

export async function guestLogin(
  slug: string,
  documentType: string,
  documentNumber: string,
  password: string
): Promise<GuestSession> {
  const res = await fetch(`${PUBLIC_API}/${slug}/guest-login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      document_type: documentType,
      document_number: documentNumber,
      password,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Error al iniciar sesión");
  }
  return res.json();
}

export async function guestLookup(
  slug: string,
  documentType: string,
  documentNumber: string
): Promise<GuestLookupResponse> {
  const res = await fetch(`${PUBLIC_API}/${slug}/guest/lookup/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      document_type: documentType,
      document_number: documentNumber,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Error al buscar cuenta");
  }
  return res.json();
}

export async function guestRequestOtp(
  slug: string,
  documentType: string,
  documentNumber: string
): Promise<{ detail: string; retry_after?: number }> {
  const res = await fetch(`${PUBLIC_API}/${slug}/guest/request-otp/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      document_type: documentType,
      document_number: documentNumber,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Error al solicitar codigo");
  }
  return res.json();
}

export async function guestActivate(
  slug: string,
  data: {
    document_type: string;
    document_number: string;
    code: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    nationality?: string;
  }
): Promise<GuestSession> {
  const res = await fetch(`${PUBLIC_API}/${slug}/guest/activate/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Error al activar cuenta");
  }
  return res.json();
}

export async function getGuestProfile(
  slug: string,
  token: string
): Promise<GuestProfile> {
  const res = await fetch(`${PUBLIC_API}/${slug}/guest-profile/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al obtener perfil");
  return res.json();
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function getGuestReservations(
  slug: string,
  token: string
): Promise<GuestReservation[]> {
  const res = await fetch(`${PUBLIC_API}/${slug}/mis-reservas/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new ApiError("Error al obtener reservas", res.status);
  return res.json();
}

export async function cancelGuestReservation(
  slug: string,
  confirmationCode: string,
  token: string
): Promise<void> {
  const res = await fetch(
    `${PUBLIC_API}/${slug}/reservations/${confirmationCode}/cancel/`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail || "Error al cancelar la reserva");
  }
}
