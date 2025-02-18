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
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        navy: {
          DEFAULT: '#1E2A38',
          light: '#2A3A4D',
          dark: '#162029',
        },
        gold: {
          DEFAULT: '#F4B400',
          light: '#FFD54F',
          dark: '#CC9900',
        },
        dark: {
          bg: '#121920',
          card: '#1A242F',
          hover: '#243242',
        },
      },
      backgroundImage: {
        'poker-pattern': "url('/poker-chips-pattern.png')",
      },
      boxShadow: {
        'glow': '0 0 20px rgba(244, 180, 0, 0.15)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.2)',
        'hover': '0 8px 30px rgba(244, 180, 0, 0.2)',
      },
    },
  },
  plugins: [],
}

