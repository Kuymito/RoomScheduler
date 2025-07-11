/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,jsx,ts,tsx,mdx}', // Added jsx
    './src/components/**/*.{js,jsx,ts,tsx,mdx}', // Added jsx
    './src/app/**/*.{js,jsx,ts,tsx,mdx}', // Added jsx
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        poppins: ['var(--font-poppins)', 'sans-serif'],
        roboto: ['var(--font-roboto)', 'sans-serif'],
        battambang: ['Battambang', 'serif'],
      },
      colors: {
        'num-blue': '#396DFB',
        'num-blue-light': '#E2E1EF',
        'num-red': '#DA3A3C',
        'num-red-light': '#F34848',
        'num-gray': '#858C95',
        'num-gray-light': '#E5E5E7',
        'num-bg': '#DAD9E9',
        'num-dark-bg': '#191F29',
        'num-content-bg': '#F8F9FB',
        'num-dark-text': '#323539',
        'num-icon-border': '#E5E5E7',
      },
      boxShadow: {
        'custom-light': '0px 1px 2px rgba(16, 24, 40, 0.04)',
        'custom-medium': '0px 2px 15px rgba(0, 0, 0, 0.25)',
        'custom-heavy': '0px 16px 30px rgba(0, 0, 0, 0.25)',
      },
      maxWidth: {
        'form-input-group': '200px',
        'alert-message': '380px',
      },
      minWidth: {
        '200px': '200px',
      }
    },
  },
  plugins: [],
};