/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {},
  },
  plugins: [],
  presets: [require("./src/ui/tailwind.config")],
}