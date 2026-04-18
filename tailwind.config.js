/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Hiragino Sans"',
          '"Noto Sans JP"',
          'sans-serif',
        ],
        hand: ['"Kalam"', '"Caveat"', '"Yomogi"', 'cursive'],
      },
      colors: {
        paper: '#fafaf7',
        ink: '#111111',
        muted: '#6b6b6b',
        line: '#e5e4df',
      },
    },
  },
  plugins: [],
};
