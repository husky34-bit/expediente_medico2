/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── New Medici design-system (HSL vars from index.css) ── */
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          glow: 'hsl(var(--primary-glow))',
          deep: 'hsl(var(--primary-deep))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        'med-accent': {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        'med-border': 'hsl(var(--border))',
        'med-input': 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        'sidebar-fg': 'hsl(var(--sidebar-foreground))',

        /* ── Legacy tokens (Login, Landing, etc.) ── */
        sidebar: {
          DEFAULT: '#1cbcb4',
          dark: '#17a8a0',
          light: '#22d4cb',
        },
        bg: {
          primary: '#f5f7fa',
          secondary: '#ffffff',
          card: '#ffffff',
          border: '#e8ecf1',
        },
        accent: {
          teal: '#1cbcb4',
          'teal-dim': '#17a8a0',
          blue: '#3b82f6',
          'blue-dim': '#2563eb',
        },
        alert: {
          red: '#ef4444',
          amber: '#f59e0b',
          green: '#22c55e',
        },
        text: {
          primary: '#1a2332',
          secondary: '#6b7b8d',
          muted: '#9ca8b4',
        },
        status: {
          stable: '#22c55e',
          recovering: '#f59e0b',
          critical: '#ef4444',
        },
      },
      backgroundImage: {
        'gradient-sidebar': 'var(--gradient-sidebar)',
        'gradient-hero': 'var(--gradient-hero)',
        'gradient-card': 'var(--gradient-card)',
        'gradient-page': 'var(--gradient-page)',
      },
      fontFamily: {
        display: ['"Inter"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        card: '16px',
        sm: '8px',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.10)',
        soft: 'var(--shadow-soft)',
        glow: 'var(--shadow-glow)',
        sidebar: '2px 0 8px rgba(0,0,0,0.08)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'blink': 'blink 1.5s infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
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
