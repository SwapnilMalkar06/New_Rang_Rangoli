/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      colors: {
        accent: {
          crimson: '#be123c',
          orange: '#ea580c',
          indigo: '#3730a3',
          gold: '#eab308',
        }
      }
    },
  },
  plugins: [],
}
