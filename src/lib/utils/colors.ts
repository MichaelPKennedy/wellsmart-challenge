/**
 * Centralized color definitions for the application
 * Single source of truth for all colors used across components
 * Used for: gauges, buttons, charts, text, UI elements
 */

export const COLORS = {
  // Primary accent color - used for gauges, buttons, charts, active states
  primary: {
    dark: '#22d3ee',    // Cyan 400 (dark mode)
    light: '#06b6d4',   // Cyan 600 (light mode)
  },

  // Background/Track colors - used for gauge tracks, backgrounds, disabled states
  background: {
    dark: '#1f2937',    // Gray 800 (dark mode)
    light: '#e2e8f0',   // Gray 100 (light mode)
  },

  // Text colors
  text: {
    primary: {
      dark: '#f1f5f9',  // Slate 100 (dark mode)
      light: '#0f172a', // Slate 900 (light mode)
    },
    secondary: {
      dark: '#94a3b8',  // Slate 400 (dark mode)
      light: '#64748b', // Slate 500 (light mode)
    },
  },

  // Utility colors
  white: '#ffffff',
  stroke: {
    dark: '#ffffff',
    light: '#0f172a',
  },
} as const;

/**
 * Get color based on theme
 * Usage: getColor('accent', isDarkMode)
 */
export function getColor(
  colorPath: keyof typeof COLORS | string,
  isDarkMode: boolean
): string {
  const parts = colorPath.split('.');
  let current: any = COLORS;

  for (const part of parts) {
    current = current[part];
    if (!current) return '#000000'; // Fallback
  }

  if (typeof current === 'object' && current !== null) {
    return isDarkMode ? current.dark : current.light;
  }

  return current;
}
