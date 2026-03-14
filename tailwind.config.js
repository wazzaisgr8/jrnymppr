/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: '#3CBFB0',
          dark: '#2A9E91',
          light: '#E8F8F6',
        },
        orange: {
          backstage: '#E8873A',
          'backstage-light': '#FDF4EE',
        },
        canvas: '#F0F0ED',
        neutral: {
          dark: '#2C2C2C',
          mid: '#6B7280',
          light: '#D1D5DB',
        },
        status: {
          current: '#6B7280',
          to_develop: '#4A90D9',
          in_progress: '#F5A623',
          done: '#3CBFB0',
          remove: '#E04C4C',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06)',
        'card-hover': '0 2px 8px rgba(60,191,176,0.15)',
      },
    },
  },
  plugins: [],
};
