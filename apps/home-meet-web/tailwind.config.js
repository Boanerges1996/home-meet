/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: [
    // Or if using `src` directory:
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      screens: {
        xs: {
          min: '320px',
          max: '639px',
        },
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
