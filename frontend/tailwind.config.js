/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: "rgba(var(--border), <alpha-value>)",
        background: "rgba(var(--background), <alpha-value>)",
        foreground: "rgba(var(--foreground), <alpha-value>)",
        primary: {
          DEFAULT: "rgba(var(--primary), <alpha-value>)",
          hover: "rgba(var(--primary-hover), <alpha-value>)",
        },
        card: {
          DEFAULT: "rgba(var(--card), <alpha-value>)",
          border: "rgba(var(--card-border), <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgba(var(--accent), <alpha-value>)",
          muted: "rgba(var(--accent-muted), <alpha-value>)",
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
