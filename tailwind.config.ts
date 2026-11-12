import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep space surfaces
        space: {
          950: "#03050b",
          900: "#070b16",
          800: "#0d1424",
          700: "#152038",
          600: "#22304f",
        },
        // The single cool accent used for HUD lines, focus and links
        ice: {
          DEFAULT: "#9fd0ff",
          dim: "#5f8fc0",
          bright: "#d6ecff",
        },
        // The single warm accent: primary actions and "you are here"
        ember: {
          DEFAULT: "#ffc37a",
          dim: "#b3824a",
        },
      },
      fontFamily: {
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
