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
        // "05 Peachy Blossom" Palette
        peachy: {
          50: '#FFF8F5',  // Warm gentle cream peach canvas
          100: '#FEEFEA', // Very soft peach wash
          200: '#FDD8CC', // Soft peach blush border / tint
          300: '#FAC0AF', // Warm peach accent
          400: '#F89D88', // Soft coral peach
          500: '#F77D65', // Peachy Blossom primary
          600: '#E8634B', // Deep vivid coral action
          700: '#C74934', // 3D claymorphic shadow border
          800: '#9C3423',
          900: '#6E2216',
          950: '#45120A',
        },
        blossom: {
          50: '#FDF2F5',
          100: '#FCE4EB', // Petal Pink
          200: '#FACADA',
          300: '#F6A8C1',
          400: '#EE7FA3',
          500: '#E65684', // Vibrant Blossom Pink
          600: '#CF3A69',
          700: '#AD2851',
        },
        butter: {
          50: '#FFFDF0',
          100: '#FFFBD9',
          200: '#FFF2B2', // Soft Buttercup Yellow
          300: '#FFE97D',
          400: '#FFDC47',
          500: '#F7C71E',
        },
        // Primary brand maps to peachy coral
        brand: {
          50: '#FFF8F5',
          100: '#FEEFEA',
          200: '#FDD8CC',
          300: '#FAC0AF',
          400: '#F89D88',
          500: '#F77D65',
          600: '#E8634B',
          700: '#C74934',
          800: '#9C3423',
          900: '#6E2216',
          950: '#45120A',
        },
        // Dark mode: Cozy nighttime berry / plum-espresso
        navy: {
          700: '#4E2C3B', // Cozy plum border
          800: '#3D222E', // Plum-chocolate card border
          900: '#2C1721', // Dark berry card surface
          950: '#1C0D15', // Midnight plum canvas
        }
      },
      boxShadow: {
        '3d-sm': '0 2px 0 0 #C74934, 0 4px 10px rgba(247, 125, 101, 0.25)',
        '3d-md': '0 4px 0 0 #C74934, 0 8px 16px rgba(247, 125, 101, 0.3)',
        '3d-pink': '0 4px 0 0 #AD2851, 0 8px 16px rgba(230, 86, 132, 0.3)',
        '3d-butter': '0 4px 0 0 #D1A20D, 0 8px 16px rgba(247, 199, 30, 0.25)',
        '3d-pressed': '0 1px 0 0 #C74934, inset 0 2px 4px rgba(0,0,0,0.15)',
        'clay-card': '0 10px 30px -5px rgba(247,125,101,0.12), inset 0 1px 2px rgba(255,255,255,0.95), 0 1px 3px rgba(0,0,0,0.03)',
        'clay-card-dark': '0 10px 30px -5px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1), 0 0 0 1px rgba(250,202,218,0.12)',
        'clay-btn': '0 4px 0 0 #C74934, 0 6px 14px rgba(247, 125, 101, 0.35), inset 0 1px 1px rgba(255,255,255,0.6)',
        'clay-btn-active': '0 1px 0 0 #C74934, 0 2px 6px rgba(247, 125, 101, 0.2), inset 0 2px 4px rgba(0,0,0,0.15)',
        'post-it': '3px 8px 18px rgba(247,199,30,0.22), 0 1px 3px rgba(0,0,0,0.06)'
      },
      fontFamily: {
        bubble: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
