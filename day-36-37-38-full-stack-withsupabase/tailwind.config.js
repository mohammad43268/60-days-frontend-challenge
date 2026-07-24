/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': '#FDEFEF',
        'bg-warm': '#F4DFD0',
        'surface': '#DAD0C2',
        'accent-ink': '#CDBBA7',
        'text-primary': '#1A1512',
        'text-muted': '#6B5D52'
      },
      fontFamily: {
        'display': ['Audex', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
