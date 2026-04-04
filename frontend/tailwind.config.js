import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans]
      },
      colors: {
        'dark-bg': '#0f1117',
        'dark-card': '#1a1f2e',
        'accent-blue': '#4f8ef7',
        'success-green': '#22c55e',
        'error-red': '#ef4444',
        'warning-amber': '#f59e0b'
      }
    }
  },
  plugins: []
}
