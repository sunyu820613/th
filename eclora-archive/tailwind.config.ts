import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F7F4EF", // 暖白 warm white
        ink: "#1C1B19", // 墨黑 ink black
        stone: {
          50: "#F7F4EF",
          100: "#EFEBE3",
          200: "#DFD9CD",
          300: "#C7BFAF",
          400: "#A49B89",
          500: "#82786A",
          600: "#635B4F",
          700: "#4A443B",
          800: "#332F29",
          900: "#1C1B19",
        },
        sage: {
          50: "#F1F4EF",
          100: "#E1E8DC",
          200: "#C3D1B9",
          300: "#A2B896",
          400: "#87A279",
          500: "#6E8B60",
          600: "#5A734E",
          700: "#485C3F",
        },
        wine: {
          50: "#F6EBEA",
          100: "#E7C9C6",
          200: "#C88E88",
          300: "#A85850",
          400: "#8A3A32",
          500: "#6E2921",
          600: "#551E18",
        },
      },
      fontFamily: {
        display: [
          "'Zen Old Mincho'",
          "'Noto Serif JP'",
          "'Noto Serif SC'",
          "serif",
        ],
        sans: [
          "'Noto Sans JP'",
          "'Noto Sans SC'",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      letterSpacing: {
        widest2: "0.28em",
      },
      maxWidth: {
        "8xl": "90rem",
      },
      boxShadow: {
        soft: "0 4px 24px rgba(28, 27, 25, 0.06)",
        card: "0 2px 12px rgba(28, 27, 25, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
