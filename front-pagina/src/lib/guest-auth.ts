import type { GuestSession } from "./types";

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)")
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

export function setGuestSession(session: GuestSession) {
  setCookie("guest_token", session.access, 1);
  setCookie("guest_name", session.guest_name, 1);
}

export function getGuestToken(): string | null {
  return getCookie("guest_token");
}

export function getGuestName(): string | null {
  return getCookie("guest_name");
}

export function clearGuestSession() {
  deleteCookie("guest_token");
  deleteCookie("guest_name");
}
