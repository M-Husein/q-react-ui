/** @type {import('tailwindcss').Config} */
export default {
  corePlugins: {
    preflight: false,
  },
  separator: '_',
  content: [
    // "./src/**/*.{html,js}",
    "./index.html",
    // "./tailwind_always_compile.html", // For always compile some class
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // blocklist: [
  //   'fixed', 'inset-0', 'm-auto', 'w-16', 'h-16', 
  //   'text-5xl', 'underline-offset-4'
  // ],
  // safelist: ['text-xl'],
  theme: {
    extend: {
      
    },
  },
  plugins: [],
}
