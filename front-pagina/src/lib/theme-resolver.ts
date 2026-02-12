import type { CSSProperties } from "react";
import type { OrganizationInfo } from "./types";
import { generateShadeScale, generateSandScale } from "./color-utils";
import { TEMPLATES, DEFAULT_PRIMARY, DEFAULT_ACCENT } from "./themes";

/** Map legacy template names to the new ones */
const LEGACY_TEMPLATE_MAP: Record<string, string> = {
  luxury: "signature",
  modern: "essential",
  tropical: "signature",
};

/** Resolve template key, handling legacy names */
export function resolveTemplateKey(raw: string): string {
  return LEGACY_TEMPLATE_MAP[raw] || raw;
}

/**
 * Resolve the full set of CSS variables for an organization's theme.
 * Always generates color scales from primary + accent hex values.
 * Falls back to defaults if no custom colors are set.
 */
export function resolveThemeVariables(org: OrganizationInfo): CSSProperties {
  const templateKey = resolveTemplateKey(org.theme_template);
  const template = TEMPLATES[templateKey] || TEMPLATES.signature;

  const primaryHex = org.theme_primary_color || DEFAULT_PRIMARY;
  const accentHex = org.theme_accent_color || DEFAULT_ACCENT;

  const vars: Record<string, string> = {};

  // Generate all color scales from the two base colors
  const primaryScale = generateShadeScale(primaryHex);
  const accentScale = generateShadeScale(accentHex);
  const sandScale = generateSandScale(primaryHex);

  for (const [shade, rgb] of Object.entries(primaryScale)) {
    vars[`--color-primary-${shade}-rgb`] = rgb;
  }
  for (const [shade, rgb] of Object.entries(accentScale)) {
    vars[`--color-accent-${shade}-rgb`] = rgb;
  }
  for (const [shade, rgb] of Object.entries(sandScale)) {
    vars[`--color-sand-${shade}-rgb`] = rgb;
  }

  // Typography
  vars["--font-heading"] = template.fontHeading;
  vars["--font-body"] = template.fontBody;

  // Border radius
  vars["--radius-sm"] = template.radiusSm;
  vars["--radius-md"] = template.radiusMd;
  vars["--radius-lg"] = template.radiusLg;

  return vars as CSSProperties;
}
