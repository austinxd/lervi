const API_URL = import.meta.env.VITE_API_URL || 'https://api.lervi.io/api/v1/public';

export interface HotelResult {
  org_name: string;
  subdomain: string;
  logo: string;
  theme_template: string;
  property_name: string;
  city: string;
  country: string;
  stars: number | null;
  hero_image: string | null;
  tagline: string;
  amenities: string[];
  min_price: string | null;
}

export interface HotelSearchResponse {
  count: number;
  page: number;
  page_size: number;
  results: HotelResult[];
}

export interface RegisterHotelData {
  hotel_name: string;
  owner_name: string;
  owner_email: string;
  owner_password: string;
  phone?: string;
  city?: string;
  country?: string;
}

export interface RegisterHotelResponse {
  organization_subdomain: string;
  admin_url: string;
  message: string;
}

export async function searchHotels(params: {
  q?: string;
  city?: string;
  stars?: number;
  page?: number;
}): Promise<HotelSearchResponse> {
  const searchParams = new URLSearchParams();
  if (params.q) searchParams.set('q', params.q);
  if (params.city) searchParams.set('city', params.city);
  if (params.stars) searchParams.set('stars', String(params.stars));
  if (params.page) searchParams.set('page', String(params.page));

  const res = await fetch(`${API_URL}/hotels/?${searchParams}`);
  if (!res.ok) throw new Error('Error al buscar hoteles');
  return res.json();
}

export async function registerHotel(data: RegisterHotelData): Promise<RegisterHotelResponse> {
  const res = await fetch(`${API_URL}/register-hotel/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || err.owner_email?.[0] || 'Error al registrar hotel');
  }
  return res.json();
}

export async function sendContact(data: {
  name: string;
  email: string;
  message: string;
}): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/contact/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al enviar mensaje');
  return res.json();
}
