// tailwind.config.cjs
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './resources/js/**/*.jsx',
    './resources/js/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2f9',
          100: '#d5dff0',
          200: '#adbfe1',
          300: '#7a9bcc',
          400: '#4d79b8',
          500: '#2a5ba0',
          600: '#1a5d94',
          700: '#174f80',
          800: '#142143',
          900: '#0d1830',
          950: '#080f1e',
        },
        gold: {
          300: '#ffd566',
          400: '#ffc533',
          500: '#ffaf00',
          600: '#e09900',
          700: '#b87c00',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
