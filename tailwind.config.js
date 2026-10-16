/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Emergency Red (matching the mockup buttons, active nav, and accents)
        red: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626', // Primary emergency red in mockup
          700: '#b91c1c', // Primary hover
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // Deep Navy / Charcoal Sidebar (matching the mockup sidebar #111827 / #0f172a)
        sidebar: {
          DEFAULT: '#111827',
          dark: '#0f172a',
          hover: '#1f2937',
          border: '#374151',
          muted: '#9ca3af',
          text: '#f3f4f6',
        },
        // Surface & Background Colors
        surface: {
          light: '#f8fafc',
          DEFAULT: '#ffffff',
          card: '#ffffff',
          border: '#e2e8f0',
        },
        // Incident Status Colors (strictly matching the mockup badges)
        status: {
          progress: {
            bg: '#fef3c7',
            text: '#b45309',
            border: '#fde68a',
          },
          resolved: {
            bg: '#dcfce7',
            text: '#15803d',
            border: '#bbf7d0',
          },
          reported: {
            bg: '#e0f2fe',
            text: '#0369a1',
            border: '#bae6fd',
          },
          verified: {
            bg: '#ede9fe',
            text: '#6d28d9',
            border: '#ddd6fe',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'resq-card': '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        'resq-elevated': '0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.06)',
      },
      borderRadius: {
        'resq': '0.5rem', // 8px for standard cards and buttons
        'resq-lg': '0.75rem', // 12px for prominent cards
      },
    },
  },
  plugins: [],
};
