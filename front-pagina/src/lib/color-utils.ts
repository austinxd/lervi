/** Convert hex (#RRGGBB) to HSL [h 0-360, s 0-1, l 0-1] */
export function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return [0, 0, l];

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;

  return [h * 360, s, l];
}

/** Convert HSL to RGB [0-255, 0-255, 0-255] */
export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = h / 360;
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

/**
 * Generate a 10-shade scale (50-900) from a single hex color.
 * Returns a record like { "50": "240 244 248", "100": "217 226 236", ... }
 * Values are RGB triplets ready for CSS `rgb(var(...) / alpha)`.
 */
export function generateShadeScale(hex: string): Record<string, string> {
  const [h, s] = hexToHsl(hex);

  // Lightness targets for each shade level
  const shades: [string, number][] = [
    ["50", 0.96],
    ["100", 0.88],
    ["200", 0.78],
    ["300", 0.66],
    ["400", 0.54],
    ["500", 0.44],
    ["600", 0.36],
    ["700", 0.28],
    ["800", 0.20],
    ["900", 0.13],
  ];

  const result: Record<string, string> = {};
  for (const [key, lightness] of shades) {
    // Desaturate lighter shades slightly for a natural look
    const satAdjust = lightness > 0.6 ? s * 0.7 : s;
    const [r, g, b] = hslToRgb(h, satAdjust, lightness);
    result[key] = `${r} ${g} ${b}`;
  }
  return result;
}

/**
 * Generate a desaturated "sand" scale from a primary hex color.
 * This creates warm neutral tones that complement the primary color.
 */
export function generateSandScale(primaryHex: string): Record<string, string> {
  const [h] = hexToHsl(primaryHex);

  const shades: [string, number, number][] = [
    ["50", 0.05, 0.98],
    ["100", 0.06, 0.96],
    ["200", 0.07, 0.91],
    ["300", 0.08, 0.84],
  ];

  const result: Record<string, string> = {};
  for (const [key, sat, lightness] of shades) {
    const [r, g, b] = hslToRgb(h, sat, lightness);
    result[key] = `${r} ${g} ${b}`;
  }
  return result;
}
