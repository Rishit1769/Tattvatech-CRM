import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/pages/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}", "./src/app/**/*.{ts,tsx}"],
  theme: { extend: { colors: { ink: "var(--foreground)", slate: { DEFAULT: "var(--foreground-muted)" }, brand: { 50: "var(--background-secondary)", 600: "var(--foreground)", 700: "var(--foreground-muted)" } } } },
  plugins: [],
};
export default config;
