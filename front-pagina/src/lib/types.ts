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
  base_occupancy: number;
  extra_adult_fee: string;
  extra_child_fee: string;
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
    extra_adults?: number;
    children?: number;
    surcharge?: string;
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

export interface CombinationRoom {
  room_type: RoomType;
  quantity: number;
  adults_per_room: number;
  children_per_room: number;
  nightly_prices: NightlyPrice[];
  subtotal: string;
}

export interface CombinationResult {
  rooms: CombinationRoom[];
  total: string;
  property_name: string;
  property_slug: string;
}

export interface AvailabilityResponse {
  results: AvailabilityResult[];
  combinations: CombinationResult[];
}

export interface GroupRoomItem {
  room_type_id: string;
  adults: number;
  children: number;
}

export interface GroupReservationRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  document_type: string;
  document_number: string;
  nationality?: string;
  check_in_date: string;
  check_out_date: string;
  rooms: GroupRoomItem[];
  special_requests?: string;
}

export interface GroupReservationConfirmation {
  group_code: string;
  reservations: ReservationConfirmation[];
  total_amount: string;
  currency: string;
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
  financial_status: string;
  total_paid: string;
  amount_due: string;
}

export interface ReservationRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  document_type?: string;
  document_number?: string;
  nationality?: string;
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
  is_verified?: boolean;
}

export interface GuestLookupResponse {
  status: "new" | "login" | "register" | "recognized";
}

export interface GuestRegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  document_type: string;
  document_number: string;
  nationality?: string;
  password: string;
}

export interface GuestProfile {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  document_type: string;
  document_number: string;
  nationality: string;
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
  payment_deadline: string | null;
}
