/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./data/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: "#1B3A2F",
          light: "#254A3B",
        },
        gold: {
          DEFAULT: "#C9A86A",
          light: "#D4B98C",
        },
        cream: {
          DEFAULT: "#FAF8F4",
          soft: "#F5F0E6",
        },
        charcoal: "#2A2A2A",
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "Helvetica Neue", "Arial", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.35em",
      },
      spacing: {
        18: "4.5rem",
      },
      transitionTimingFunction: {
        apple: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
