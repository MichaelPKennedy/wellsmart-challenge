import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        hmi: {
          bg: {
            primary: '#f0f4f8', // Slightly darker for better contrast
            secondary: '#ffffff', // White
            card: '#ffffff', // White
            hover: '#e8ecf1', // Darker hover state
            border: '#cbd5e1', // Slate 300 - darker for visibility
          },
          status: {
            ok: '#0891b2', // Cyan 600 - darker for better contrast
            warning: '#d97706', // Amber 600 - darker
            error: '#dc2626', // Red 600 - darker
            offline: '#475569', // Slate 600 - darker
            info: '#2563eb', // Blue 600 - darker
          },
          text: {
            primary: '#0f172a', // Slate 900 (Dark text)
            secondary: '#44546f', // Darker gray for better readability
            muted: '#64748b', // Slate 500
            inverse: '#f8fafc', // Slate 50
          },
          accent: {
            primary: '#0891b2', // Cyan 600 - darker
            secondary: '#0369a1', // Cyan 700 - even darker
          },
          dark: {
            bg: {
              primary: '#020617', // Very dark slate
              secondary: '#0f172a',
              card: '#111827', // Gray 900
              hover: '#1f2937',
              border: '#1f2937',
            },
            text: {
              primary: '#f1f5f9',
              secondary: '#94a3b8',
              muted: '#64748b',
            },
            accent: {
              primary: '#22d3ee', // Cyan 400
            }
          },
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
