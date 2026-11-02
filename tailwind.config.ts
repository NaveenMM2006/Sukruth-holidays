import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0C2B3D", // monsoon night
        lagoon: { DEFAULT: "#1F7A8C", dark: "#155A68", light: "#BFDBE0" },
        marigold: { DEFAULT: "#F4B63F", dark: "#D99A1E" },
        mist: "#EAF2F3",
        paper: "#F8FBFB",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(12,43,61,.06), 0 12px 32px -12px rgba(12,43,61,.25)",
      },
      keyframes: {
        drift: {
          "0%": { transform: "translateY(18px) rotate(var(--r))", opacity: "0" },
          "100%": { transform: "translateY(0) rotate(var(--r))", opacity: "1" },
        },
      },
      animation: { drift: "drift .9s cubic-bezier(.2,.8,.2,1) both" },
    },
  },
  plugins: [],
};

export default config;
