export { THEMES } from "./data";
export type { ThemePreset } from "./types";

export function getCSSVariables(theme: {
  colors: Record<string, string>;
  radius: string;
}): string {
  const { colors, radius } = theme;
  return `
    --radius: ${radius};
    --primary: ${colors.primary};
    --primary-foreground: ${colors.primaryForeground};
    --secondary: ${colors.secondary};
    --secondary-foreground: ${colors.secondaryForeground};
    --muted: ${colors.muted};
    --muted-foreground: ${colors.mutedForeground};
    --accent: ${colors.accent};
    --accent-foreground: ${colors.accentForeground};
    --background: ${colors.background};
    --foreground: ${colors.foreground};
    --border: ${colors.border};
    --ring: ${colors.ring};
  `.trim();
}
