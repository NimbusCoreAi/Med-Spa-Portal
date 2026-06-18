import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Service type colors
        service: {
          botox: '#3b82f6',
          massage: '#10b981',
          laser: '#f59e0b',
          skincare: '#ec4899',
          consultation: '#8b5cf6',
        },
        // Status colors
        status: {
          active: '#10b981',
          inactive: '#6b7280',
          pending: '#f59e0b',
          cancelled: '#ef4444',
        },
      },
      spacing: {
        'safe-top': 'max(1rem, env(safe-area-inset-top))',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideIn: {
          'from': { transform: 'translateX(100%)' },
          'to': { transform: 'translateX(0)' },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}
export default config
