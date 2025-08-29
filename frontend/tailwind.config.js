/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Vazir', '"Vazirmatn FD"', 'system-ui', 'sans-serif']
      },
      colors: {
        brand: {
          50: '#f5f9ff',
          100: '#e6f1fe',
          200: '#c4dffd',
          300: '#9ecbfb',
          400: '#4fa2f7',
          500: '#1d6fe0',
          600: '#1558b3',
          700: '#0f3f80',
          800: '#0a2a54',
          900: '#06162b'
        },
        surface: {
          50: '#1b1c1f', // cards
          100: '#16171a', // sidebar / secondary
          200: '#121315', // page background
          300: '#202227', // borders subtle
          400: '#2a2d33'  // hover
        }
      }
    }
  },
  plugins: []
};
