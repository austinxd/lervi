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
  description: string;
  tagline: string;
  whatsapp: string;
  amenities: string[];
  payment_methods: string[];
  languages: string[];
  stars: number | null;
  hero_image: string;
  logo: string;
  created_at: string;
  updated_at: string;
}

export interface PropertyPhoto {
  id: string;
  image: string;
  caption: string;
  sort_order: number;
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
  base_occupancy: number;
  extra_adult_fee: string;
  extra_child_fee: string;
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

// ---- RENIEC ----
export interface ReniecResponse {
  source: string;
  data: {
    dni: string;
    preNombres: string;
    apePaterno: string;
    apeMaterno: string;
    feNacimiento?: string;
    sexo?: string;
  };
}

// ---- Reservation ----
export type OperationalStatus = 'incomplete' | 'pending' | 'confirmed' | 'check_in' | 'check_out' | 'cancelled' | 'no_show';
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
  property: string | null;
  bank_name: string;
  account_holder: string;
  account_number: string;
  cci: string;
  currency: string;
  is_active: boolean;
  sort_order: number;
  level: 'organization' | 'property';
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
export interface RoomTypeOccupancy {
  id: string;
  name: string;
  total_rooms: number;
  occupied: number;
  occupancy_rate: number;
  upcoming_demand: number;
}

export interface DashboardAlert {
  type: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
  count: number;
}

export interface DashboardToday {
  date: string;
  reservations: {
    check_ins_today: number;
    check_outs_today: number;
    in_house: number;
    incomplete: number;
    pending: number;
  };
  rooms: {
    total: number;
    by_status: Record<string, number>;
    ready: number;
    not_ready: number;
  };
  tasks: {
    pending: number;
    in_progress: number;
    completed_today: number;
    by_type: Record<string, number>;
    urgent: number;
  };
  revenue_today: string;
  room_type_occupancy: RoomTypeOccupancy[];
  alerts: DashboardAlert[];
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

export interface FunnelStep {
  step: string;
  sessions: number;
}

export interface CheckoutFriction {
  guest_lookup_started: number;
  guest_login_success: number;
  otp_requested: number;
  otp_verified: number;
  login_completion_pct: number;
  otp_completion_pct: number;
  avg_checkout_seconds: number | null;
}

export interface WebFunnelData {
  period: { start: string; end: string };
  funnel: FunnelStep[];
  checkout_friction: CheckoutFriction;
  kpi_bridge: {
    total_reservations: number;
    web_reservations: number;
    pct_direct: number;
  };
  insights: {
    main_abandonment_step: string | null;
    main_abandonment_drop_pct: number;
    current_conversion_rate: number;
    prev_conversion_rate: number;
    wow_change: number;
  };
}

// ---- Billing ----
export interface BillingConfig {
  id: string;
  emission_mode: 'disabled' | 'manual' | 'automatic';
  ruc: string;
  razon_social: string;
  direccion_fiscal: string;
  proveedor: 'nubefact' | 'efact' | 'custom_webhook';
  tipo_autenticacion: 'api_key' | 'certificate' | 'oauth2';
  api_endpoint: string;
  ambiente: 'produccion' | 'beta';
  configuracion_tributaria: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PropertyBillingConfig {
  id: string;
  property: string;
  usa_configuracion_propia: boolean;
  emission_mode: 'inherit' | 'disabled' | 'manual' | 'automatic';
  proveedor: string;
  api_endpoint: string;
  serie_boleta: string;
  serie_factura: string;
  establecimiento_codigo: string;
  punto_emision: string;
  resolved_config: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: string;
  unit_price: string;
  subtotal: string;
  igv: string;
  total: string;
  tipo_afectacion_igv: string;
  sort_order: number;
}

export interface InvoiceListItem {
  id: string;
  numero_completo: string;
  document_type: string;
  status: string;
  cliente_razon_social: string;
  cliente_numero_documento: string;
  total: string;
  currency: string;
  fecha_emision: string;
  property: string;
  property_name: string;
  reservation: string | null;
  reservation_code: string | null;
  retry_count: number;
  last_error: string;
  created_at: string;
}

export interface InvoiceDetail extends InvoiceListItem {
  serie: string;
  correlativo: number;
  cliente_tipo_documento: string;
  cliente_direccion: string;
  cliente_email: string;
  total_gravado: string;
  total_exonerado: string;
  total_inafecto: string;
  total_descuentos: string;
  total_igv: string;
  fecha_vencimiento: string | null;
  provider_document_url: string;
  sunat_ticket: string;
  provider_http_status: number;
  provider_latency_ms: number;
  last_attempt_at: string | null;
  related_invoice: string | null;
  observaciones: string;
  items: InvoiceItem[];
  updated_at: string;
}
