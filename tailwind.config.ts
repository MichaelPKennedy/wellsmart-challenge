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
            primary: '#f8fafc', // Slate 50 (Light)
            secondary: '#ffffff', // White
            card: '#ffffff', // White
            hover: '#f1f5f9', // Slate 100
            border: '#e2e8f0', // Slate 200
          },
          status: {
            ok: '#06b6d4', // Cyan 500
            warning: '#f59e0b',
            error: '#ef4444',
            offline: '#64748b',
            info: '#3b82f6',
          },
          text: {
            primary: '#0f172a', // Slate 900 (Dark text)
            secondary: '#64748b', // Slate 500
            muted: '#94a3b8', // Slate 400
            inverse: '#f8fafc', // Slate 50
          },
          accent: {
            primary: '#06b6d4', // Cyan 500
            secondary: '#0891b2', // Cyan 600
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
