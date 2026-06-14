import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pitch: {
          950: '#050a0e',
          900: '#0a1628',
          800: '#0f2040',
          700: '#1a3a5c',
          600: '#1e4976',
        },
        gold: {
          400: '#f5c518',
          500: '#e6b800',
          600: '#cc9900',
        },
      },
    },
  },
  plugins: [],
};
export default config;
