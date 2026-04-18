/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0f1a',
          secondary: '#0f1829',
          card: '#111827',
          border: '#1e3050',
        },
        accent: {
          teal: '#00d4aa',
          'teal-dim': '#00b891',
          blue: '#0088ff',
          'blue-dim': '#0070d4',
        },
        alert: {
          red: '#ff4d6d',
          amber: '#f59e0b',
          green: '#10b981',
        },
        text: {
          primary: '#e2e8f0',
          secondary: '#94a3b8',
          muted: '#475569',
        }
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        sm: '8px',
      },
      boxShadow: {
        teal: '0 0 20px rgba(0, 212, 170, 0.15)',
        'teal-lg': '0 0 40px rgba(0, 212, 170, 0.25)',
        card: '0 4px 24px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out',
        'pulse-teal': 'pulseTeal 2s infinite',
        'blink': 'blink 1.5s infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseTeal: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0, 212, 170, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 212, 170, 0.7)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      },
    },
  },
  plugins: [],
}
