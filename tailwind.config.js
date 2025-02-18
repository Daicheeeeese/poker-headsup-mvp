/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        navy: '#1E2A38',
        gold: '#F4B400',
        darkGray: '#2C3E50',
        lightBg: '#F8F9FA',
      },
      boxShadow: {
        'custom': '0px 4px 12px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}

