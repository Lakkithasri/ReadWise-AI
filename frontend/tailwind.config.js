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
        brand: {
          50: '#FFF9F5',
          100: '#FFF1E6', // PEACH VEIL
          200: '#FDE0C7',
          300: '#FACBA2',
          400: '#F2B277', // SOFT APRICOT
          500: '#E8740C', // Bright Mandarin
          600: '#D96C00', // MANDARIN GLOW (Primary action color)
          700: '#9C3F00', // BURNT ORANGE (Hover & rich accents)
          800: '#6A2E00', // DEEP AMBER (Deep contrast & borders)
          900: '#4A1F00',
          950: '#2C1200',
        },
        navy: {
          800: '#261C16', // Warm deep amber surface border
          900: '#1A120C', // Warm dark card surface
          950: '#100B07', // Warm obsidian dark mode background
        }
      },
    },
  },
  plugins: [],
}
