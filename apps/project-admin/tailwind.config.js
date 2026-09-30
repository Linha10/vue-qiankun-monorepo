/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  // 避免 Tailwind 的 reset 樣式與 Element Plus 衝突
  corePlugins: {
    preflight: false,
  },
  // 避免 class 名稱與 Element Plus 衝突
  prefix: 'tw-',
  theme: {
    extend: {},
  },
  plugins: [],
}