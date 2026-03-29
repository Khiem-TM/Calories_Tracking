/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary green palette
        primary: {
          DEFAULT: '#006d3a',
          container: '#3dae6b',
          fixed: '#8af9ae',
          'fixed-dim': '#6edc94',
        },
        // Secondary
        secondary: {
          DEFAULT: '#516258',
          container: '#d1e4d7',
          fixed: '#d4e7da',
          'fixed-dim': '#b8cbbe',
        },
        // Tertiary (warning/orange)
        tertiary: {
          DEFAULT: '#9d4400',
          container: '#ea7c3b',
          fixed: '#ffdbca',
          'fixed-dim': '#ffb690',
        },
        // Surface hierarchy
        surface: {
          DEFAULT: '#eaffed',
          bright: '#eaffed',
          dim: '#cbdfce',
          low: '#e4f9e7',
          lowest: '#ffffff',
          container: '#def3e2',
          high: '#d9eddc',
          highest: '#d3e8d7',
          variant: '#d3e8d7',
          tint: '#006d3a',
        },
        // On-colors (text)
        'on-surface': {
          DEFAULT: '#0e1f15',
          variant: '#3e4a40',
        },
        'on-primary': '#ffffff',
        'on-secondary': '#ffffff',
        'on-tertiary': '#ffffff',
        'on-background': '#0e1f15',
        // Outline
        outline: {
          DEFAULT: '#6e7a6f',
          variant: '#bdcabd',
        },
        // Inverse
        'inverse-surface': '#233429',
        'inverse-on-surface': '#e1f6e5',
        'inverse-primary': '#6edc94',
        // Error
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        },
        'on-error': '#ffffff',
        'on-error-container': '#93000a',
        // Macro nutrients (unchanged)
        macroProtein: '#3b82f6',
        macroFat: '#eab308',
        macroCarbs: '#22c55e',
        macroFiber: '#f97316',
        // Legacy brand alias for gradual migration
        brand: {
          DEFAULT: '#006d3a',
          dark: '#006d3a',
          light: '#3dae6b',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        manrope: ['Manrope', 'system-ui', 'sans-serif'],
        newsreader: ['Newsreader', 'Georgia', 'serif'],
        mono: ['"DM Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        full: '9999px',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #006d3a, #3dae6b)',
        'gradient-surface': 'linear-gradient(180deg, #eaffed, #e4f9e7)',
      },
      boxShadow: {
        ambient: '0 16px 32px 0 rgba(14,31,21,0.06)',
        card: '0 2px 8px 0 rgba(14,31,21,0.04)',
      },
    },
  },
  plugins: [],
}
