import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      height: {
        '9/10': '85%',
        '8.5/10': '85%',
      }
    },
  },
  plugins: [],
} satisfies Config;
