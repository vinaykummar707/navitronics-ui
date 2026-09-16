/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      borderColor: {
        DEFAULT: "var(--color-neutral-border)",
      },
    },
  },
  plugins: [],
  presets: [require("./src/ui/tailwind.config")],
}