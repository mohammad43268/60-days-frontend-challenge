/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--color-canvas)',
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        primary: '#FF6B00',
        'primary-hover': '#E66000',
        accent: '#FEF3C7',
        dark: 'var(--color-text)',
        'dot-color': 'var(--color-dots)'
      },
      boxShadow: {
        floating: '0 10px 25px -3px rgba(255, 107, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
