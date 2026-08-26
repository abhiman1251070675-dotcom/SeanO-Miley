/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111112',
        coal: '#0B0B0D',
        bone: '#F2F0E9',
        pink: '#FF3D8A',
        lime: '#C8FF3D',
        gold: '#E9C46A',
      },
      fontFamily: {
        display: ['"Unbounded Variable"', 'sans-serif'],
        body: ['"Space Grotesk Variable"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', 'monospace'],
      },
    },
  },
  plugins: [],
}
