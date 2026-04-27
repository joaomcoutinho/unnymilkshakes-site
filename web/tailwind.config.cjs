/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        aurum: {
          primary: {
            base: '#FFED00',
            light: '#FFF780',
            dark: '#CCBD00',
          },
          secondary: {
            base: '#7B2FBE',
            light: '#A66FD9',
            dark: '#5A1A8A',
          },
          text: {
            primary: '#121212',
            muted: '#6B7280',
            onPrimary: '#7B3F97',
            onSecondary: '#FFFFFF',
          },
          surface: {
            light: '#F8FAFC',
          },
          feedback: {
            success: '#10B981',
            warn: '#F59E0B',
            error: '#EF4444',
          },
        },
        unny: {
          /* Mesmo amarelo do AURUM primary — uma tonalidade em todo o site */
          yellow: '#FFED00',
          purple: '#7B2FBE',
          purpleDeep: '#3A0B5A',
        },
      },
      fontFamily: {
        heading: ['Montserrat', 'system-ui', 'sans-serif'],
        body: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tighter2: '-0.02em',
      },
      borderRadius: {
        aurum: '8px',
      },
      boxShadow: {
        aurum: '0 10px 15px -3px rgba(0,0,0,0.10)',
      },
      transitionTimingFunction: {
        aurum: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      spacing: {
        18: '72px',
      },
    },
  },
  plugins: [],
}

