/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#111318', 700: '#2b2e36', 600: '#41464f', 500: '#535963', 400: '#6f7681' },
        paper: '#f1f1ee',
        mist: '#e8e8e2',
        line: { DEFAULT: '#e4e4dd', strong: '#d3d3ca' },
        brand: { 50: '#f5f5f2', 100: '#eaeae4', 600: '#23262d', 700: '#14161b', 800: '#0b0c0f' },
        sand: '#f1f1ee',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Noto Sans', 'Noto Sans Devanagari', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      fontSize: {
        xs: ['0.8125rem', '1.35'],
        sm: ['0.9375rem', '1.45'],
        base: ['1.0625rem', '1.55'],
        lg: ['1.1875rem', '1.5'],
        xl: ['1.3125rem', '1.4'],
        '2xl': ['1.5rem', '1.3'],
        '3xl': ['1.875rem', '1.2'],
        '4xl': ['2.25rem', '1.15'],
      },
      borderRadius: {
        '4xl': '1.75rem',
        '5xl': '2rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(17,19,24,0.04), 0 12px 32px -18px rgba(17,19,24,0.22)',
        soft: '0 1px 2px rgba(17,19,24,0.05), 0 2px 8px -4px rgba(17,19,24,0.10)',
        lift: '0 2px 4px rgba(17,19,24,0.05), 0 24px 48px -24px rgba(17,19,24,0.30)',
        ink: '0 10px 24px -12px rgba(11,12,15,0.55)',
      },
      letterSpacing: {
        label: '0.10em',
      },
    },
  },
  plugins: [],
}
