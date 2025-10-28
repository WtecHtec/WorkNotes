/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './test/**/*.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {},
  },
  // 组件库以 IIFE 注入到宿主页，关闭预设的 CSS reset，避免影响宿主
  corePlugins: { preflight: false },
  safelist: ['bg-red-500', 'text-white', 'p-2', 'rounded'],
};
