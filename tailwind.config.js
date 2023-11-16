module.exports = {
  important: true,
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    screens: {
      short: { raw: '(max-height: 200px)' },
      xs: '400px',
      sm: '640px',
      // => @media (min-width: 640px) { ... }

      md: '768px',
      // => @media (min-width: 768px) { ... }

      lg: '1024px',
      // => @media (min-width: 1024px) { ... }

      xl: '1280px',
      // => @media (min-width: 1280px) { ... }

      '2xl': '1536px',
      // => @media (min-width: 1536px) { ... }
    },
    extend: {
      colors: {
        primary: {
          light: 'rgb(var(--primary-light) / <alpha-value>)',
          DEFAULT: 'rgb(var(--primary-DEFAULT) / <alpha-value>)',
          dark: 'rgb(var(--primary-dark) / <alpha-value>)',
          darker: 'rgb(var(--primary-darker) / <alpha-value>)',
        },
        light: {
          DEFAULT: 'rgb(var(--light-DEFAULT) / <alpha-value>)',
          always: 'rgb(var(--light-always) / <alpha-value>)',
        },
        dark: {
          DEFAULT: 'rgb(var(--dark-DEFAULT) / <alpha-value>)',
          always: 'rgb(var(--dark-always) / <alpha-value>)',
        },
        surface: 'rgb(var(--surface) / <alpha-value>)',
      },
      fontSize: {
        headline1: [
          '96px',
          {
            letterSpacing: '-1.5px',
          },
        ],
        headline2: [
          '60px',
          {
            letterSpacing: '-0.5px',
          },
        ],
        headline3: [
          '48px',
          {
            letterSpacing: '0px',
          },
        ],
        headline4: [
          '34px',
          {
            letterSpacing: '0.25px',
          },
        ],

        headline5: [
          '24px',
          {
            letterSpacing: '0px',
          },
        ],

        headline6: [
          '20px',
          {
            letterSpacing: '0.15px',
          },
        ],
        subtitle1: [
          '16px',
          {
            letterSpacing: '0.15px',
          },
        ],
        subtitle2: [
          '14px',
          {
            letterSpacing: '0.1px',
          },
        ],
        body1: [
          '16px',
          {
            letterSpacing: '0.5px',
          },
        ],
        body2: [
          '14px',
          {
            letterSpacing: '0.25px',
          },
        ],
        button: [
          '14px',
          {
            letterSpacing: '1.25px',
          },
        ],
        caption: [
          '12px',
          {
            letterSpacing: '0.4px',
          },
        ],
        overline: [
          '10px',
          {
            letterSpacing: '1.5px',
          },
        ],
      },
      keyframes: {
        fadeIn: {
          '0%': { transform: 'translateX(1rem)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '100' },
        },
      },
      animation: {
        intro: 'fadeIn 0.75s ease-in-out',
      },
      gridTemplateColumns: {
        onboardingHonors: '40px minmax(0, 1fr)',
      },
      fontFamily: {
        kallisto: ['var(--font-kallisto)', 'Roboto', 'sans-serif'],
        inter: ['var(--font-inter)', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
