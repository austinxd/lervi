export interface PropertyPhoto {
  id: string;
  image: string;
  caption: string;
  sort_order: number;
}

export interface PropertySummary {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  check_in_time: string;
  check_out_time: string;
  contact_phone: string;
  contact_email: string;
  whatsapp: string;
  policies: Record<string, unknown>;
  description: string;
  tagline: string;
  amenities: string[];
  payment_methods: string[];
  languages: string[];
  stars: number | null;
  hero_image: string | null;
  logo: string | null;
  photos: PropertyPhoto[];
}

export interface OrganizationInfo {
  id: string;
  name: string;
  subdomain: string;
  currency: string;
  logo: string;
  primary_color: string;
  secondary_color: string;
  theme_template: 'essential' | 'signature' | 'premium';
  theme_palette: string;
  theme_primary_color: string;
  theme_accent_color: string;
  social_links: {
    instagram?: string;
    facebook?: string;
    tripadvisor?: string;
    google_maps?: string;
  };
  properties: PropertySummary[];
  is_multi_property: boolean;
}

export interface RoomTypePhoto {
  id: string;
  image: string;
  caption: string;
  sort_order: number;
  is_cover: boolean;
}

export interface BedConfigurationDetail {
  bed_type: string;
  quantity: number;
}

export interface BedConfiguration {
  id: string;
  name: string;
  details: BedConfigurationDetail[];
}

export interface RoomType {
  id: string;
  name: string;
  slug: string;
  description: string;
  max_adults: number;
  max_children: number;
  base_price: string;
  amenities: string[];
  size_sqm: string | null;
  view_type: string;
  bathroom_type: string;
  highlights: string[];
  cover_photo: string | null;
  photos: RoomTypePhoto[];
  property_name: string;
  property_slug: string;
}

export interface RoomTypeDetail extends RoomType {
  bed_configurations: BedConfiguration[];
}

export interface NightlyPrice {
  date: string;
  base: string;
  final: string;
  adjustments: Array<{
    type: string;
    name?: string;
    modifier?: string;
    before: string;
    after: string;
  }>;
}

export interface AvailabilityResult {
  room_type: RoomType;
  available_rooms: number;
  nightly_prices: NightlyPrice[];
  total: string;
  property_name: string;
  property_slug: string;
}

export interface ReservationConfirmation {
  confirmation_code: string;
  check_in_date: string;
  check_out_date: string;
  room_type: string;
  total_amount: string;
  currency: string;
  guest_name: string;
  payment_deadline: string | null;
  has_bank_accounts: boolean;
}

export interface BankAccount {
  id: string;
  bank_name: string;
  account_holder: string;
  account_number: string;
  cci: string;
  currency: string;
}

export interface ReservationLookup extends ReservationConfirmation {
  voucher_image: string | null;
  operational_status: string;
}

export interface ReservationRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  document_type?: string;
  document_number?: string;
  room_type_id: string;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children: number;
  special_requests?: string;
  promotion_code?: string;
}

export interface GuestSession {
  access: string;
  guest_name: string;
  guest_id: string;
}

export interface GuestReservation {
  confirmation_code: string;
  room_type: string;
  check_in_date: string;
  check_out_date: string;
  operational_status: string;
  financial_status: string;
  total_amount: string;
  currency: string;
  voucher_image: string | null;
  property_name: string;
}
