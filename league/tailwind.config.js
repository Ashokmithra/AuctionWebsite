/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      maxHeight: {
        100: "35.5rem",
        98: "30rem",
      },
      width: {
        100: "30rem",
        90: "368px",
        38: "153px",
        130: "50rem",
      },
      margin: {
        100: "42rem",
      },
      height: {
        100: "36rem",
      },
    },
  },
  plugins: [],
};
