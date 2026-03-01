/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0df259',
        'primary-dark': '#0ab843',
        'bg-light': '#f5f8f6',
        'bg-dark': '#102216',
        'surface-light': '#ffffff',
        'surface-dark': '#1a3322',
        'text-main': '#111813',
        'text-secondary': '#608a6e',
        kakao: '#FEE500',
      },
      fontFamily: {
        display: ['Spline Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
