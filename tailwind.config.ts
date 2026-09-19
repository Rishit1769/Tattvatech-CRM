import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/pages/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}", "./src/app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#101828",
        slate: "#667085",
        brand: {
          50: "#eef4ff",
          600: "#335cff",
          700: "#2546cc",
        },
      },
    },
  },
  plugins: [],
};

export default config;
