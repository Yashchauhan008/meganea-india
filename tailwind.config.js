/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Main Theme Colors
        primary: '#3b82f6', // blue-500
        'primary-hover': '#2563eb', // blue-600
        background: '#f9fafb', // gray-50
        foreground: '#ffffff',
        border: '#e5e7eb', // gray-200
        text: '#111827', // gray-900
        'text-secondary': '#6b7280', // gray-500
        
        // Dark Mode Theme Colors
        'dark-primary': '#3b82f6',
        'dark-primary-hover': '#2563eb',
        'dark-background': '#111827', // gray-900
        'dark-foreground': '#1f2937', // gray-800
        'dark-border': '#374151', // gray-700
        
        // --- THIS IS THE CORRECTED LINE ---
        'dark-text': '#ffffff', // Changed from '#f9fafb' (gray-50) to pure white
        // ------------------------------------

        'dark-text-secondary': '#9ca3af', // gray-400

        // FORM-SPECIFIC COLORS
        'form-input-bg': '#f3f4f6', // gray-100 for light mode
        'dark-form-input-bg': '#111827', // gray-900 for dark mode
      },
    },
  },
  plugins: [],
}
