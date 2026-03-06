/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#edfff3',
          100: '#d5ffe6',
          200: '#aeffcf',
          300: '#70ffab',
          400: '#2bfd80',
          500: '#00e85e',
          600: '#00682B',
          700: '#005323',
          800: '#00411b',
          900: '#003617',
          950: '#001e0d',
        },
        cream: {
          50: '#FFFEF8',
          100: '#FFFBD5',
          200: '#FFF7AA',
          300: '#FFF280',
          400: '#FFED55',
          500: '#FFE82B',
        },
      },
    },
  },
  plugins: [],
};
