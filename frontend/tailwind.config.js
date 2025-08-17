/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Smart IV Pole specific colors
        'iv-normal': '#10b981', // green-500
        'iv-warning': '#f59e0b', // amber-500
        'iv-critical': '#ef4444', // red-500
        'iv-offline': '#6b7280', // gray-500
      },
      animation: {
        'pulse-warning': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-critical': 'pulse-critical 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-critical': {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.8, transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
}