import type { Config } from 'tailwindcss';

// Colours come from CSS variables so one switch can re-theme the whole app.
const token = (name: string) => `rgb(var(--color-${name}) / <alpha-value>)`;

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: token('bg'),
        surface: token('surface'),
        ink: token('ink'),
        muted: token('muted'),
        primary: token('primary'),
        'primary-fg': token('primary-fg'),
        line: token('line'),
        focus: token('focus'),
        success: token('success'),
        danger: token('danger'),
        warning: token('warning'),
      },
    },
  },
  plugins: [],
};

export default config;
