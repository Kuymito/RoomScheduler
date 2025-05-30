/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,jsx,ts,tsx,mdx}',
    './src/components/**/*.{js,jsx,ts,tsx,mdx}',
    './src/app/**/*.{js,jsx,ts,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'], // Assuming Inter is your default sans
        poppins: ['var(--font-poppins)', 'sans-serif'],
        roboto: ['var(--font-roboto)', 'sans-serif'], // Roboto for the alert title
      },
      colors: {
        'num-blue': '#396DFB',
        'num-blue-light': '#E2E1EF',
        'num-red': '#DA3A3C',
        'num-red-light': '#F34848',
        'num-gray': '#858C95',         // Existing gray, suitable for alert descriptive text
        'num-gray-light': '#E5E5E7',
        'num-bg': '#DAD9E9',
        'num-content-bg': '#F8F9FB',
        'num-dark-text': '#323539',   // Existing dark text, suitable for alert title
        'num-icon-border': '#E5E5E7',

        // Colors for SuccessAlert
        'alert-success-icon-bg': '#68C335',      // Green for icon background
        'alert-success-icon-border': '#7CDE45',  // Lighter green for icon border
        'alert-button-text-light': '#EBEAFF', // Text color for the blue alert button
        'alert-close-icon': '#737373',         // Color for the close 'x' icon

        // White and Black are standard in Tailwind (bg-white, text-black)
        // but you can alias them if needed:
        // 'white': '#FFFFFF',
        // 'black': '#000000',
      },
      boxShadow: {
        'custom-light': '0px 1px 2px rgba(16, 24, 40, 0.04)',
        'custom-medium': '0px 2px 15px rgba(0, 0, 0, 0.25)',
        'custom-heavy': '0px 16px 30px rgba(0, 0, 0, 0.25)', // This matches the alert's shadow
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