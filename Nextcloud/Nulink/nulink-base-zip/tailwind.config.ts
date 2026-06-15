import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./pages/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { colors: { nulink: { blue: '#0066FF', dark: '#0044CC', light: '#3385FF' } } } },
  plugins: [],
};
export default config;
