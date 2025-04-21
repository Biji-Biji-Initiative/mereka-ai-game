/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}",
    "./src/app/**/*.{html,ts,scss}",
    "./src/app/components/**/*.{html,ts,scss}",
    "./src/app/pages/**/*.{html,ts,scss}",
    "./src/index.html",
    "./src/app/**/*.component.{html,ts,scss}"
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color)',
        secondary: 'var(--secondary-color)',
      },
    },
  },
  plugins: [],
}

