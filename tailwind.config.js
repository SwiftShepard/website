/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#9F68FF',
        'primary-light': '#b48aff',
        'background': '#000000',
        'text': '#ffffff',
        'text-gray': '#e0e0e0',
      },
      fontFamily: {
        montserrat: ['var(--font-montserrat)'],
      },
      gridTemplateRows: {
        '12': 'repeat(12, minmax(0, 1fr))',
      }
    },
  },
  plugins: [],
}; 