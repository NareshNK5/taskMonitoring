// tailwind.config.js
module.exports = {
    content: [
      "./src/**/*.{html,js,jsx,ts,tsx}",  // Ensure Tailwind scans these files
    ],
    theme: {
      extend: {
        colors: {
          primary: '#1D4ED8', 
          secondary: '#F59E0B',
        },
        spacing: {
          72: '18rem',
        },
      },
    },
    plugins: [],
  }
  