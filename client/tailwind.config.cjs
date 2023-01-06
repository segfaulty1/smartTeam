/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
    screens: {
      'sm>': { max: '640px' },
      'md>': { max: '768px' },
      'lg>': { max: '1024px' },
      'xl>': { max: '1280px' },

      'sm<': { min: '641px' },
      'md<': { min: '768px' },
      'lg<': { min: '1024px' },
      'xl<': { min: '1280px' },
    },
  },
  plugins: [],
};
