/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 0 1px rgba(0,190,255,0.35), 0 20px 70px rgba(0,0,0,0.55)",
      },
    },
  },
  plugins: [],
};