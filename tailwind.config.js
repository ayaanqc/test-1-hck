/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f1c2e',
        brand: { 50: '#eef6ff', 100: '#d9ecff', 600: '#0b5cad', 700: '#094a8a', 800: '#073a6d' },
        sand: '#fbf8f3',
      },
      fontSize: {
        xs: ['1rem', '1.4'],
        sm: ['1rem', '1.45'],
        base: ['1.0625rem', '1.55'],
        lg: ['1.1875rem', '1.5'],
        xl: ['1.3125rem', '1.4'],
        '2xl': ['1.5rem', '1.3'],
        '3xl': ['1.875rem', '1.2'],
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Noto Sans', 'Noto Sans Devanagari', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
