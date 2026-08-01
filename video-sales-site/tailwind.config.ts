import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tiffany: {
          50: "#f0fbfa",
          100: "#d9f4f1",
          200: "#b3e9e3",
          300: "#81d8d0",
          400: "#5cc9be",
          500: "#3bb3a7",
          600: "#2c8f86",
          700: "#26726c",
          800: "#215b57",
          900: "#1e4c49",
        },
        blush: {
          50: "#fff6f7",
          100: "#ffe9ec",
          200: "#ffd2d9",
          300: "#ffb0bc",
        },
        sand: {
          50: "#fdfbf7",
          100: "#f8f3ea",
          200: "#f0e7d8",
        },
      },
      fontFamily: {
        display: [
          "'Zen Maru Gothic'",
          "'Hiragino Maru Gothic ProN'",
          "sans-serif",
        ],
        body: [
          "'Zen Kaku Gothic New'",
          "'Hiragino Sans'",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 10px 40px -12px rgba(59, 179, 167, 0.25)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
