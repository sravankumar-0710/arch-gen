// filepath: src/tailwind.config.js
// Purpose: Tailwind CSS configuration — ArchGen design tokens, Linear-inspired dark blue theme

/** @type {import('tailwindcss').Config} */
export default {
  // FIXED: paths are relative to this file (src/), so index.html is one level up
  content: [
  './src/index.html',
  './src/**/*.{js,jsx}',
],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        accent: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        ink: {
          950: '#08080c',
          900: '#0d0d12',
          800: '#13131a',
          700: '#1a1a24',
          600: '#22222f',
          500: '#2e2e3e',
          400: '#3d3d52',
          300: '#5a5a72',
          200: '#8b8ba8',
          100: '#c4c4d4',
          50:  '#eeeef5',
        },
      },
      boxShadow: {
        'glow-accent': '0 0 20px rgba(99,102,241,0.35)',
        'glow-sm':     '0 0 10px rgba(99,102,241,0.2)',
        'card':        '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'modal':       '0 25px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)',
      },
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        'fadeUp':  'fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both',
        'fadeIn':  'fadeIn 0.25s ease both',
        'scaleIn': 'scaleIn 0.3s cubic-bezier(0.16,1,0.3,1) both',
        'shimmer': 'shimmer 1.4s linear infinite',
      },
    },
  },
  plugins: [],
}