/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["DM Sans", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        ink: {
          DEFAULT: "#0f0f0f",
          50: "#f7f7f5",
          100: "#ededea",
          200: "#d8d8d2",
          300: "#b8b8ae",
          400: "#8f8f83",
          500: "#6e6e62",
          600: "#55554b",
          700: "#43433b",
          800: "#2e2e28",
          900: "#1a1a16",
          950: "#0f0f0c",
        },
        sand: {
          DEFAULT: "#e8e0d0",
          50: "#faf8f4",
          100: "#f2ede3",
          200: "#e8e0d0",
          300: "#d4c9b2",
          400: "#c0b090",
          500: "#a8946c",
        },
        amber: {
          accent: "#d4a853",
          light: "#f0c87a",
          dark: "#a07830",
        },
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease forwards",
        "fade-in": "fadeIn 0.5s ease forwards",
        "slide-in": "slideIn 0.5s ease forwards",
        "blink": "blink 1s step-end infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
