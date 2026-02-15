import type { CSSProperties } from "react";
import type { OrganizationInfo } from "./types";
import { generateShadeScale, generateSandScale } from "./color-utils";
import { TEMPLATES } from "./themes";

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
 * Uses org.primary_color when set, otherwise falls back to template default.
 */
export function resolveThemeVariables(org: OrganizationInfo): CSSProperties {
  const templateKey = resolveTemplateKey(org.theme_template);
  const template = TEMPLATES[templateKey] || TEMPLATES.signature;

  const vars: Record<string, string> = {};

  // Use org custom color if set, otherwise use template default
  const primaryColor =
    org.primary_color && /^#[0-9a-fA-F]{6}$/.test(org.primary_color)
      ? org.primary_color
      : template.primaryColor;

  const primaryScale = generateShadeScale(primaryColor);
  const accentScale = generateShadeScale(template.accentColor);
  const sandScale = generateSandScale(primaryColor);

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
