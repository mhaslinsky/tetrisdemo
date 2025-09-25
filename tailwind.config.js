/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "bg-tetris-cyan",
    "border-tetris-cyan",
    "bg-tetris-yellow",
    "border-tetris-yellow",
    "bg-tetris-purple",
    "border-tetris-purple",
    "bg-tetris-green",
    "border-tetris-green",
    "bg-tetris-red",
    "border-tetris-red",
    "bg-tetris-blue",
    "border-tetris-blue",
    "bg-tetris-orange",
    "border-tetris-orange",
  ],
  theme: {
    extend: {
      colors: {
        tetris: {
          cyan: "#00f0f0",
          yellow: "#f0f000",
          purple: "#a000f0",
          green: "#00f000",
          red: "#f00000",
          blue: "#0000f0",
          orange: "#f0a000",
        },
      },
      animation: {
        "line-clear": "flash 0.5s ease-in-out",
        "piece-drop": "drop 0.3s ease-out",
        "piece-move": "slide 0.15s ease-out",
        "piece-rotate": "rotate-pulse 0.2s ease-out",
        "block-clear": "clear 0.5s ease-in-out",
      },
      keyframes: {
        flash: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        drop: {
          "0%": { transform: "translateY(-10px)", opacity: "0.8" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slide: {
          "0%": { transform: "scale(0.95)", opacity: "0.9" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "rotate-pulse": {
          "0%": { transform: "scale(1) rotate(0deg)" },
          "50%": { transform: "scale(1.05) rotate(5deg)" },
          "100%": { transform: "scale(1) rotate(0deg)" },
        },
        clear: {
          "0%": { opacity: "1", transform: "scale(1)" },
          "25%": { opacity: "0.8", transform: "scale(1.1)" },
          "50%": { opacity: "0.3", transform: "scale(1.2)", backgroundColor: "#ffffff" },
          "75%": { opacity: "0.1", transform: "scale(1.1)" },
          "100%": { opacity: "0", transform: "scale(0.8)" },
        },
      },
    },
  },
  plugins: [],
};
