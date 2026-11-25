/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        resq: {
          navy: '#0B132B',
          dark: '#1C2541',
          blue: '#1D4ED8',
          crimson: '#DC2626',
          amber: '#D97706',
          emerald: '#059669',
          surface: '#F8FAFC'
        }
      }
    },
  },
  plugins: [],
}
