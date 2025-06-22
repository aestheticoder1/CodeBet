/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['Roboto Mono', 'monospace'], // Add custom Roboto Mono
        sans: ['Roboto Mono', 'monospace'], // 👈 Use this if you want it globally
      },
      colors: {
        primary: '#facc15',
        background: '#111827',
        secondary: '#4ade80',
        tertiary: '#ef4444',
        card: '#1f2937',
      },
    },
  },
  plugins: [],
}
