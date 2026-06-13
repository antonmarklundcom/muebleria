import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Scandinavian minimalist palette
        paper: '#FAFAF8', // page background (near-white)
        ink: '#1A1A1A', // headings (near-black)
        muted: '#555555', // body text
        charcoal: '#1F1F1F', // footer (neutral charcoal)
        line: '#ECECEC', // hairline borders
        // Single muted accent: soft clay, used sparingly
        clay: {
          50: '#F7F1EB',
          100: '#EEDFD3',
          200: '#DCC4AC',
          300: '#C7A684',
          400: '#B08968',
          500: '#9C7656',
          600: '#856249',
          700: '#6C4F3B',
        },
        whatsapp: '#25D366',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'Cambria', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
