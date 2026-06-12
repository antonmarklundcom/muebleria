import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        wood: {
          50: '#faf6f1',
          100: '#f0e6d8',
          200: '#e0ccb0',
          300: '#ccab82',
          400: '#b98a5c',
          500: '#a97347',
          600: '#925d3c',
          700: '#764833',
          800: '#623c2f',
          900: '#523329',
        },
        iron: {
          800: '#26221f',
          900: '#1a1714',
        },
        whatsapp: '#25D366',
      },
    },
  },
  plugins: [],
};

export default config;
