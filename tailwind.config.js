/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // enable manual dark mode via .dark on <html> [web:211][web:208]
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',     // Indigo
        background: '#F9FAFB',  // Cool Gray
        accent: '#10B981',      // Emerald
      },
    },
  },
  plugins: [],
};
