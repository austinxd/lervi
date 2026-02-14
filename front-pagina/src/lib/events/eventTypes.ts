export const EVENT_NAMES = {
  PAGE_VIEW: "page_view",
  SEARCH_DATES: "search_dates",
  ROOM_VIEW: "room_view",
  START_BOOKING: "start_booking",
  GUEST_LOOKUP_STARTED: "guest_lookup_started",
  GUEST_LOOKUP_RESULT: "guest_lookup_result",
  GUEST_LOGIN_SUCCESS: "guest_login_success",
  OTP_REQUESTED: "otp_requested",
  OTP_VERIFIED: "otp_verified",
  BOOKING_CONFIRMED: "booking_confirmed",
  BOOKING_ABANDONED: "booking_abandoned",
} as const;

export type EventName = (typeof EVENT_NAMES)[keyof typeof EVENT_NAMES];

export interface TrackingEvent {
  event: EventName;
  timestamp: number;
  session_id: string;
  hotel_slug: string;
  guest_id?: string;
  metadata?: Record<string, unknown>;
}
