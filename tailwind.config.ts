import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        /* Veloura palette — white & cream with a muted gold accent */
        cream: {
          50: "#FDFBF7",
          100: "#FAF6EF",
          200: "#F3EBDD",
          300: "#EADFC9",
          400: "#DECEAE",
        },
        gold: {
          DEFAULT: "#B89B72",
          light: "#C9B188",
          dark: "#9A7E56",
        },
        ink: {
          DEFAULT: "#2E2A24",
          soft: "#5B5347",
          muted: "#8A8073",
        },
        line: "#EAE0CF",
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        ring: "var(--ring)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      borderRadius: {
        lg: "1rem",
        xl: "1.5rem",
        "2xl": "2rem",
      },
      boxShadow: {
        soft: "0 4px 24px -8px rgba(46, 42, 36, 0.12)",
        card: "0 2px 16px -6px rgba(46, 42, 36, 0.10)",
        lift: "0 12px 40px -12px rgba(46, 42, 36, 0.18)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateX(var(--slide-from, 16px))" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out both",
        "slide-in": "slide-in 0.4s ease-out both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
