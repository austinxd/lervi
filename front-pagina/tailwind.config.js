/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "rgb(var(--color-primary-50-rgb) / <alpha-value>)",
          100: "rgb(var(--color-primary-100-rgb) / <alpha-value>)",
          200: "rgb(var(--color-primary-200-rgb) / <alpha-value>)",
          300: "rgb(var(--color-primary-300-rgb) / <alpha-value>)",
          400: "rgb(var(--color-primary-400-rgb) / <alpha-value>)",
          500: "rgb(var(--color-primary-500-rgb) / <alpha-value>)",
          600: "rgb(var(--color-primary-600-rgb) / <alpha-value>)",
          700: "rgb(var(--color-primary-700-rgb) / <alpha-value>)",
          800: "rgb(var(--color-primary-800-rgb) / <alpha-value>)",
          900: "rgb(var(--color-primary-900-rgb) / <alpha-value>)",
        },
        accent: {
          50: "rgb(var(--color-accent-50-rgb) / <alpha-value>)",
          100: "rgb(var(--color-accent-100-rgb) / <alpha-value>)",
          200: "rgb(var(--color-accent-200-rgb) / <alpha-value>)",
          300: "rgb(var(--color-accent-300-rgb) / <alpha-value>)",
          400: "rgb(var(--color-accent-400-rgb) / <alpha-value>)",
          500: "rgb(var(--color-accent-500-rgb) / <alpha-value>)",
          600: "rgb(var(--color-accent-600-rgb) / <alpha-value>)",
          700: "rgb(var(--color-accent-700-rgb) / <alpha-value>)",
          800: "rgb(var(--color-accent-800-rgb) / <alpha-value>)",
          900: "rgb(var(--color-accent-900-rgb) / <alpha-value>)",
        },
        sand: {
          50: "rgb(var(--color-sand-50-rgb) / <alpha-value>)",
          100: "rgb(var(--color-sand-100-rgb) / <alpha-value>)",
          200: "rgb(var(--color-sand-200-rgb) / <alpha-value>)",
          300: "rgb(var(--color-sand-300-rgb) / <alpha-value>)",
        },
      },
      fontFamily: {
        serif: ["var(--font-heading)"],
        sans: ["var(--font-body)"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "fade-in-up": "fadeInUp 0.6s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
