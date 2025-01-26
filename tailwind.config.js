/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-blue-light': '#fffaf0e6',  
        'custom-blue': '#4A90E2',        
        'custom-blue-dark': '#202A44',   
      },
    },
  },
  plugins: [],
}

