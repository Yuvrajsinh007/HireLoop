/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Sets Inter as the default font
      },
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1', // Maps to your indigo-500
          600: '#4f46e5', // Primary button color
          700: '#4338ca', // Hover state
        }
      }
    },
  },
  plugins: [],
}