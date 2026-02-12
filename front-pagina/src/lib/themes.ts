export interface TemplateConfig {
  fontHeading: string;
  fontBody: string;
  radiusSm: string;
  radiusMd: string;
  radiusLg: string;
  googleFontsUrl: string;
}

export const TEMPLATES: Record<string, TemplateConfig> = {
  essential: {
    fontHeading: "'Inter', system-ui, sans-serif",
    fontBody: "'Inter', system-ui, sans-serif",
    radiusSm: "0.5rem",
    radiusMd: "0.75rem",
    radiusLg: "1rem",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
  },
  signature: {
    fontHeading: "'Playfair Display', Georgia, serif",
    fontBody: "'Inter', system-ui, sans-serif",
    radiusSm: "0.25rem",
    radiusMd: "0.5rem",
    radiusLg: "0.75rem",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap",
  },
  premium: {
    fontHeading: "'Cormorant Garamond', Georgia, serif",
    fontBody: "'Inter', system-ui, sans-serif",
    radiusSm: "0",
    radiusMd: "0.125rem",
    radiusLg: "0.25rem",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap",
  },
};

/** Default colors when no custom colors are set */
export const DEFAULT_PRIMARY = "#0f1f33";
export const DEFAULT_ACCENT = "#c9a96e";
