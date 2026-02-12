// ---- Common ----
export type UserRole = 'maintenance' | 'housekeeping' | 'reception' | 'manager' | 'owner' | 'super_admin';

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ---- Auth ----
export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

// ---- User ----
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  organization: string;
  organization_name?: string;
  properties: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  properties?: string[];
  is_active?: boolean;
}

// ---- Organization ----
export type ThemeTemplate = 'essential' | 'signature' | 'premium';

export interface Organization {
  id: string;
  name: string;
  legal_name: string;
  tax_id: string;
  timezone: string;
  currency: string;
  language: string;
  logo: string;
  primary_color: string;
  secondary_color: string;
  font: string;
  subdomain: string;
  custom_domain: string;
  theme_template: ThemeTemplate;
  social_links: Record<string, string>;
  plan: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ---- Property ----
export interface Property {
  id: string;
  organization: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  check_in_time: string;
  check_out_time: string;
  policies: Record<string, unknown>;
  contact_phone: string;
  contact_email: string;
  is_active: boolean;
  logo: string;
  created_at: string;
  updated_at: string;
}

// ---- Room Type ----
export interface RoomTypePhoto {
  id: string;
  image: string;
  caption: string;
  sort_order: number;
  is_cover: boolean;
}

export interface BedConfigurationDetail {
  id?: string;
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
  property: string;
  name: string;
  slug: string;
  description: string;
  max_adults: number;
  max_children: number;
  base_price: string;
  amenities: string[];
  is_active: boolean;
  bed_configurations: BedConfiguration[];
  photos: RoomTypePhoto[];
  created_at: string;
  updated_at: string;
}

// ---- Room ----
export type RoomStatus = 'available' | 'occupied' | 'dirty' | 'cleaning' | 'inspection' | 'blocked' | 'maintenance';

export interface Room {
  id: string;
  property: string;
  room_types: string[];
  room_type_names: string[];
  number: string;
  floor: string;
  status: RoomStatus;
  active_bed_configuration: string | null;
  active_bed_configuration_name: string | null;
  created_at: string;
  updated_at: string;
}

// ---- Guest ----
export interface GuestNote {
  id: string;
  content: string;
  created_by: string;
  created_by_name: string | null;
  created_at: string;
}

export interface Guest {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  document_type: string;
  document_number: string;
  nationality: string;
  country_of_residence: string;
  is_vip: boolean;
  notes?: GuestNote[];
  created_at: string;
  updated_at?: string;
}

// ---- Reservation ----
export type OperationalStatus = 'pending' | 'confirmed' | 'check_in' | 'check_out' | 'cancelled' | 'no_show';
export type FinancialStatus = 'pending_payment' | 'partial' | 'paid' | 'partial_refund' | 'refunded';
export type OriginType = 'website' | 'walk_in' | 'phone' | 'ota' | 'other';
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'online';
export type PaymentStatus = 'pending' | 'completed' | 'refunded' | 'failed';

export interface Payment {
  id: string;
  amount: string;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  gateway_reference: string;
  notes: string;
  created_by: string;
  created_by_name: string | null;
  processed_at: string;
}

export interface ReservationList {
  id: string;
  confirmation_code: string;
  guest: string;
  guest_name: string;
  property: string;
  property_name: string;
  room_type: string;
  room_type_name: string;
  room: string | null;
  room_number: string | null;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children: number;
  total_amount: string;
  currency: string;
  operational_status: OperationalStatus;
  financial_status: FinancialStatus;
  origin_type: OriginType;
  created_at: string;
}

export interface ReservationDetail extends ReservationList {
  requested_bed_configuration: string | null;
  origin_metadata: Record<string, unknown>;
  special_requests: string;
  voucher_image: string | null;
  payment_deadline: string | null;
  payments: Payment[];
  created_by: string;
  updated_at: string;
}

export interface BankAccount {
  id: string;
  property: string;
  bank_name: string;
  account_holder: string;
  account_number: string;
  cci: string;
  currency: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ReservationCreate {
  guest: string;
  property: string;
  room_type: string;
  room?: string;
  requested_bed_configuration?: string;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children: number;
  total_amount: string;
  currency?: string;
  origin_type: OriginType;
  origin_metadata?: Record<string, unknown>;
  special_requests?: string;
}

// ---- Task ----
export type TaskType = 'cleaning' | 'inspection' | 'maintenance' | 'bed_prep' | 'other';
export type TaskPriority = 'normal' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface TaskItem {
  id: string;
  task_type: TaskType;
  property: string;
  property_name: string;
  room: string | null;
  room_number: string | null;
  assigned_to: string | null;
  assigned_to_name: string | null;
  assigned_role: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
  notes?: string;
  result?: string;
  completed_at?: string | null;
  created_by?: string;
  created_by_name?: string | null;
  created_at: string;
  updated_at?: string;
}

// ---- Pricing ----
export interface Season {
  id: string;
  property: string;
  name: string;
  start_month: number;
  start_day: number;
  end_month: number;
  end_day: number;
  price_modifier: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DayOfWeekPricing {
  id: string;
  property: string;
  day_of_week: number;
  day_name: string;
  price_modifier: string;
}

export interface RatePlan {
  id: string;
  property: string;
  room_type: string;
  room_type_name: string;
  name: string;
  plan_type: string;
  price_modifier: string;
  min_nights: number;
  min_advance_days: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Promotion {
  id: string;
  property: string;
  name: string;
  code: string;
  discount_percent: string | null;
  discount_fixed: string | null;
  start_date: string;
  end_date: string;
  min_nights: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PriceCalculationRequest {
  property_id: string;
  room_type_id: string;
  check_in: string;
  check_out: string;
  rate_plan_id?: string;
  promotion_code?: string;
}

export interface PriceCalculationResponse {
  base_total: string;
  final_total: string;
  nights: number;
  daily_breakdown: { date: string; price: string }[];
  modifiers_applied: { name: string; amount: string }[];
}

// ---- Automation ----
export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  conditions: Record<string, unknown>;
  actions: Record<string, unknown>;
  priority: number;
  is_active: boolean;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface AutomationLog {
  id: string;
  rule: string;
  rule_name: string;
  trigger: string;
  event_data: Record<string, unknown>;
  conditions_met: boolean;
  actions_executed: Record<string, unknown>;
  success: boolean;
  error_message: string;
  created_at: string;
}

// ---- Dashboard ----
export interface DashboardToday {
  date: string;
  reservations: {
    check_ins_today: number;
    check_outs_today: number;
    in_house: number;
    pending: number;
  };
  rooms: {
    total: number;
    by_status: Record<string, number>;
  };
  tasks: {
    pending: number;
    in_progress: number;
    completed_today: number;
  };
  revenue_today: string;
}

export interface OccupancyData {
  total_rooms: number;
  current: {
    occupied: number;
    occupancy_rate: number;
  };
  daily: {
    date: string;
    occupied_rooms: number;
    occupancy_rate: number;
  }[];
}

export interface RevenueData {
  period: { start: string; end: string };
  revenue: {
    total: string;
    payment_count: number;
    by_method: Record<string, { total: string; count: number }>;
  };
  daily: { date: string; revenue: string }[];
  reservations: {
    created: number;
    by_status: Record<string, number>;
  };
}
