/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ayurveda: {
          primary: '#8B4513',
          secondary: '#D2691E',
          accent: '#F4A460',
          light: '#FFF8DC',
          dark: '#654321'
        }
      }
    },
  },
  plugins: [],
}