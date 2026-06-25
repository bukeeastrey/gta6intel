/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#080810',
        surface: '#0f0f1a',
        surface2: '#16162a',
        border: '#1e1e35',
        border2: '#2a2a45',
        accent: '#ff6b00',
        'text-primary': '#e2e2f0',
        'text-muted': '#5a5a78',
        confirmed: '#00ff94',
        rumor: '#ffd600',
        leak: '#ff3855',
        analysis: '#4a9eff',
      },
      fontFamily: {
        display: ['var(--font-bebas)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
    },
  },
  plugins: [],
}
