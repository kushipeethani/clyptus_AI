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
          darkest: '#050308',
          darker: '#08050F',
          DEFAULT: '#0B0714',
        },
        surface: {
          100: '#100A1A',
          200: '#140D20',
          300: '#181025',
          glass: 'rgba(20, 10, 30, 0.65)',
          'glass-deep': 'rgba(12, 6, 20, 0.85)',
        },
        cyber: {
          purple: {
            DEFAULT: '#A855F7',
            deep: '#7C3AED',
            vibrant: '#9333EA',
            light: '#C084FC',
            neon: '#B86BFF',
            glow: '#D8B4FE',
          },
          cyan: '#38BDF8',
          pink: '#F472B6',
          emerald: '#34D399',
          border: 'rgba(168, 85, 247, 0.18)',
        },
        text: {
          primary: '#F8F7FF',
          secondary: '#A8A0B8',
          muted: '#6B6280',
        },
        primary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Outfit', 'Space Grotesk', 'sans-serif'],
      },
      backgroundImage: {
        'command-grad': 'linear-gradient(135deg, #050308 0%, #0B0615 50%, #050308 100%)',
        'button-grad': 'linear-gradient(135deg, #7C3AED 0%, #9333EA 50%, #A855F7 100%)',
        'button-grad-hover': 'linear-gradient(135deg, #9333EA 0%, #A855F7 50%, #C084FC 100%)',
        'neon-border-grad': 'linear-gradient(90deg, rgba(168,85,247,0.4), rgba(184,107,255,0.8), rgba(168,85,247,0.4))',
      },
      boxShadow: {
        'glass': '0 20px 60px rgba(0, 0, 0, 0.45)',
        'glass-hover': '0 25px 70px rgba(0, 0, 0, 0.65), 0 0 25px rgba(168, 85, 247, 0.25)',
        'neon-purple': '0 0 20px rgba(168, 85, 247, 0.35)',
        'neon-strong': '0 0 30px rgba(184, 107, 255, 0.5)',
        'neon-cyan': '0 0 20px rgba(56, 189, 248, 0.35)',
        'inner-glow': 'inset 0 0 20px rgba(168, 85, 247, 0.15)',
        'button-3d': '0 4px 15px rgba(124, 58, 237, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'spin-slow': 'spin 12s linear infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(0.98)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
    },
  },
  plugins: [],
}
