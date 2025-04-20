
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'guardian-primary': '#4B84F1',
        'guardian-accent': '#A7F16D',
        'guardian-error': '#FF6B6B',
        'guardian-background': '#F5F5F5',
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      keyframes: {
        'bus-roll': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
      },
      animation: {
        'bus-roll': 'bus-roll 1s ease-out',
        'shake': 'shake 0.5s ease-in-out',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
