/** @type {import('tailwindcss').Config} */
import animatePlugin from 'tailwindcss-animate';
import accessibilityPlugin from './src/lib/tailwind/plugins/accessibility-plugin';

const tailwindConfig = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        border: 'oklch(var(--border))',
        input: 'oklch(var(--input))',
        ring: 'oklch(var(--ring))',
        background: 'oklch(var(--background))',
        foreground: 'oklch(var(--foreground))',
        primary: {
          DEFAULT: 'oklch(var(--primary))',
          foreground: 'oklch(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'oklch(var(--secondary))',
          foreground: 'oklch(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'oklch(var(--destructive))',
          foreground: 'oklch(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'oklch(var(--muted))',
          foreground: 'oklch(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'oklch(var(--accent))',
          foreground: 'oklch(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'oklch(var(--popover))',
          foreground: 'oklch(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'oklch(var(--card))',
          foreground: 'oklch(var(--card-foreground))',
        },
        // AI theme specific colors
        ai: {
          blue: 'oklch(var(--ai-blue))',
          purple: 'oklch(var(--ai-purple))',
          cyan: 'oklch(var(--ai-cyan))',
          green: 'oklch(var(--ai-green))',
          yellow: 'oklch(var(--ai-yellow))',
          red: 'oklch(var(--ai-red))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontSize: {
        'larger-text': '1.125rem',
        'larger-h1': '2.25rem',
        'larger-h2': '1.875rem',
        'larger-h3': '1.5rem',
        'larger-h4': '1.25rem',
        'larger-h5': '1.125rem',
        'larger-h6': '1rem',
      },
      boxShadow: {
        'glow-primary': 'var(--glow-primary)',
        'glow-accent': 'var(--glow-accent)',
        'glow-blue': 'var(--glow-blue)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulse: {
          '0%, 100%': { opacity: 0.6 },
          '50%': { opacity: 1 },
        },
        'border-glow': {
          '0%, 100%': { 
            'box-shadow': '0 0 5px oklch(var(--primary) / 0.5)',
            'border-color': 'oklch(var(--primary) / 0.8)'
          },
          '50%': { 
            'box-shadow': '0 0 20px oklch(var(--primary) / 0.7)',
            'border-color': 'oklch(var(--primary))'
          },
        },
        'background-pan': {
          '0%': { 'background-position': '0% center' },
          '100%': { 'background-position': '200% center' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'border-glow': 'border-glow 2s ease-in-out infinite',
        'background-pan': 'background-pan 3s linear infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, oklch(var(--primary)) 0%, oklch(var(--accent)) 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    animatePlugin,
    accessibilityPlugin,
  ],
  future: {
    // Enable v4 features
    hoverOnlyWhenSupported: true,
    disableColorOpacityUtilitiesByDefault: false,
    respectDefaultRingColorOpacity: true,
  },
};

export default tailwindConfig;
