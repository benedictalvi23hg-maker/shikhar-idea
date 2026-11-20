/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tactical: {
          bg: "#0B0E0B",
          surface: "#121712",
          card: "#182018",
          cardHover: "#1E271E",
          border: "#283528",
          borderLight: "#3B4E3B",
          olive: "#607F35",
          oliveLight: "#7FA845",
          oliveDark: "#3D5321",
          khaki: "#C2B280",
          khakiDark: "#8E825D",
          amber: "#E5A93C",
          red: "#EF4444",
          green: "#10B981",
          cyan: "#06B6D4",
          text: "#E2E8F0",
          muted: "#94A3B8"
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Space Grotesk"', 'monospace', 'ui-monospace']
      }
    },
  },
  plugins: [],
}
