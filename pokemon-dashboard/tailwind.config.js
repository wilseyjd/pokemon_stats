/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pokemon: {
          dark:               '#2c3e50',
          'dark-alt':         '#34495e',
          muted:              '#7f8c8d',
          neutral:            '#95a5a6',
          border:             '#ecf0f1',
          surface:            '#f8f9fa',
          'card-bg':          '#fffdf0',
          red:                '#e74c3c',
          'red-dark':         '#c0392b',
          'red-light':        '#fdecea',
          blue:               '#3498db',
          'blue-dark':        '#2980b9',
          green:              '#27ae60',
          'bg-from':          '#d4e2fc',
          'bg-to':            '#d4e0f0',
          'select-highlight': '#d6eaf8',
          'select-hover':     '#eaf4fd',
        },
      },
    },
  },
  plugins: [],
}
