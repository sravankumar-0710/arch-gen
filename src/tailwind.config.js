// filepath: src/tailwind.config.js
// Purpose: Tailwind CSS configuration — extends default theme with ArchGen design tokens

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ArchGen brand palette
        brand: {
          50: '#f0f4ff',
          100: '#dce6ff',
          200: '#b9ccff',
          300: '#85a8ff',
          400: '#4d7dff',
          500: '#2558f5',
          600: '#1540d6',
          700: '#1030ad',
          800: '#122b8c',
          900: '#142870',
        },
        surface: {
          DEFAULT: '#0f1117',
          raised: '#171b26',
          overlay: '#1e2335',
          border: '#2a3048',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        serif: ['DM Serif Display', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
