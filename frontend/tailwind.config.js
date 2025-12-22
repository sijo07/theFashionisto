/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "gold": "#D4AF37",
        "gold-light": "#F4C430",
        "gold-dark": "#AA6C39",
        "primary": "#1A1A1A",
      },
    },
  },
  plugins: [],
};
