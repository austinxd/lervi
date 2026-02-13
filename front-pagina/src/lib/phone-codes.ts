export interface PhoneCode {
  country: string;
  code: string;
  dial: string;
  flag: string;
}

/** Common country phone codes, Latin America first. */
export const COUNTRY_PHONE_CODES: PhoneCode[] = [
  { country: "PE", code: "PE", dial: "+51", flag: "\ud83c\uddf5\ud83c\uddea" },
  { country: "CO", code: "CO", dial: "+57", flag: "\ud83c\udde8\ud83c\uddf4" },
  { country: "EC", code: "EC", dial: "+593", flag: "\ud83c\uddea\ud83c\udde8" },
  { country: "BO", code: "BO", dial: "+591", flag: "\ud83c\udde7\ud83c\uddf4" },
  { country: "CL", code: "CL", dial: "+56", flag: "\ud83c\udde8\ud83c\uddf1" },
  { country: "AR", code: "AR", dial: "+54", flag: "\ud83c\udde6\ud83c\uddf7" },
  { country: "BR", code: "BR", dial: "+55", flag: "\ud83c\udde7\ud83c\uddf7" },
  { country: "MX", code: "MX", dial: "+52", flag: "\ud83c\uddf2\ud83c\uddfd" },
  { country: "VE", code: "VE", dial: "+58", flag: "\ud83c\uddfb\ud83c\uddea" },
  { country: "UY", code: "UY", dial: "+598", flag: "\ud83c\uddfa\ud83c\uddfe" },
  { country: "PY", code: "PY", dial: "+595", flag: "\ud83c\uddf5\ud83c\uddfe" },
  { country: "CR", code: "CR", dial: "+506", flag: "\ud83c\udde8\ud83c\uddf7" },
  { country: "PA", code: "PA", dial: "+507", flag: "\ud83c\uddf5\ud83c\udde6" },
  { country: "US", code: "US", dial: "+1", flag: "\ud83c\uddfa\ud83c\uddf8" },
  { country: "CA", code: "CA", dial: "+1", flag: "\ud83c\udde8\ud83c\udde6" },
  { country: "ES", code: "ES", dial: "+34", flag: "\ud83c\uddea\ud83c\uddf8" },
  { country: "FR", code: "FR", dial: "+33", flag: "\ud83c\uddeb\ud83c\uddf7" },
  { country: "DE", code: "DE", dial: "+49", flag: "\ud83c\udde9\ud83c\uddea" },
  { country: "IT", code: "IT", dial: "+39", flag: "\ud83c\uddee\ud83c\uddf9" },
  { country: "GB", code: "GB", dial: "+44", flag: "\ud83c\uddec\ud83c\udde7" },
  { country: "PT", code: "PT", dial: "+351", flag: "\ud83c\uddf5\ud83c\uddf9" },
  { country: "JP", code: "JP", dial: "+81", flag: "\ud83c\uddef\ud83c\uddf5" },
  { country: "CN", code: "CN", dial: "+86", flag: "\ud83c\udde8\ud83c\uddf3" },
  { country: "KR", code: "KR", dial: "+82", flag: "\ud83c\uddf0\ud83c\uddf7" },
  { country: "AU", code: "AU", dial: "+61", flag: "\ud83c\udde6\ud83c\uddfa" },
];

/** Get the dial code for a country ISO code. Falls back to +51 (PE). */
export function getDialCode(countryCode: string): string {
  const found = COUNTRY_PHONE_CODES.find(
    (c) => c.code === countryCode.toUpperCase()
  );
  return found?.dial || "+51";
}
