/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg:       '#0e0f11',
        surface:  '#16181c',
        surface2: '#1e2026',
        accent:   '#c8f542',
        jebai:    '#7b61ff',
        mkt:      '#42d9f5',
        caixa:    '#f5a742',
        meta1:    '#c8f542',
        meta2:    '#42d9f5',
        meta3:    '#f5a742',
      },
      fontFamily: {
        sans: ['Syne', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
