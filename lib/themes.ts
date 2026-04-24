export interface ThemePreset {
  id: string;
  name: string;
  colors: {
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    background: string;
    foreground: string;
    border: string;
    ring: string;
  };
  radius: string;
}

export const THEMES: ThemePreset[] = [
  {
    id: "default",
    name: "Default",
    radius: "0.5rem",
    colors: {
      primary: "24 100% 50%",
      primaryForeground: "0 0% 100%",
      secondary: "220 10% 96%",
      secondaryForeground: "220 10% 10%",
      muted: "220 10% 96%",
      mutedForeground: "220 10% 40%",
      accent: "220 10% 96%",
      accentForeground: "220 10% 10%",
      background: "0 0% 100%",
      foreground: "220 10% 10%",
      border: "220 10% 90%",
      ring: "24 100% 50%",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    radius: "0.5rem",
    colors: {
      primary: "210 100% 40%",
      primaryForeground: "0 0% 100%",
      secondary: "210 50% 90%",
      secondaryForeground: "210 50% 10%",
      muted: "210 50% 90%",
      mutedForeground: "210 50% 40%",
      accent: "210 50% 90%",
      accentForeground: "210 50% 10%",
      background: "210 40% 98%",
      foreground: "210 50% 10%",
      border: "210 50% 85%",
      ring: "210 100% 40%",
    },
  },
  {
    id: "forest",
    name: "Forest",
    radius: "0.5rem",
    colors: {
      primary: "140 50% 35%",
      primaryForeground: "0 0% 100%",
      secondary: "140 30% 90%",
      secondaryForeground: "140 30% 10%",
      muted: "140 30% 90%",
      mutedForeground: "140 30% 40%",
      accent: "140 30% 90%",
      accentForeground: "140 30% 10%",
      background: "140 20% 98%",
      foreground: "140 30% 10%",
      border: "140 30% 85%",
      ring: "140 50% 35%",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    radius: "0.5rem",
    colors: {
      primary: "30 80% 50%",
      primaryForeground: "0 0% 100%",
      secondary: "30 60% 90%",
      secondaryForeground: "30 60% 10%",
      muted: "30 60% 90%",
      mutedForeground: "30 60% 40%",
      accent: "30 60% 90%",
      accentForeground: "30 60% 10%",
      background: "30 40% 98%",
      foreground: "30 60% 10%",
      border: "30 60% 85%",
      ring: "30 80% 50%",
    },
  },
  {
    id: "lavender",
    name: "Lavender",
    radius: "0.5rem",
    colors: {
      primary: "260 60% 60%",
      primaryForeground: "0 0% 100%",
      secondary: "260 30% 90%",
      secondaryForeground: "260 30% 10%",
      muted: "260 30% 90%",
      mutedForeground: "260 30% 40%",
      accent: "260 30% 90%",
      accentForeground: "260 30% 10%",
      background: "260 20% 98%",
      foreground: "260 30% 10%",
      border: "260 30% 85%",
      ring: "260 60% 60%",
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    radius: "0.5rem",
    colors: {
      primary: "240 60% 60%",
      primaryForeground: "0 0% 100%",
      secondary: "240 30% 15%",
      secondaryForeground: "240 10% 90%",
      muted: "240 30% 15%",
      mutedForeground: "240 10% 70%",
      accent: "240 30% 15%",
      accentForeground: "240 10% 90%",
      background: "240 40% 8%",
      foreground: "240 10% 90%",
      border: "240 30% 20%",
      ring: "240 60% 60%",
    },
  },
  {
    id: "rose",
    name: "Rose",
    radius: "1rem",
    colors: {
      primary: "350 70% 50%",
      primaryForeground: "0 0% 100%",
      secondary: "350 30% 92%",
      secondaryForeground: "350 30% 10%",
      muted: "350 30% 92%",
      mutedForeground: "350 30% 40%",
      accent: "350 30% 92%",
      accentForeground: "350 30% 10%",
      background: "0 0% 100%",
      foreground: "350 30% 10%",
      border: "350 30% 85%",
      ring: "350 70% 50%",
    },
  },
  {
    id: "mint",
    name: "Mint",
    radius: "0.75rem",
    colors: {
      primary: "160 60% 40%",
      primaryForeground: "0 0% 100%",
      secondary: "160 30% 92%",
      secondaryForeground: "160 30% 10%",
      muted: "160 30% 92%",
      mutedForeground: "160 30% 40%",
      accent: "160 30% 92%",
      accentForeground: "160 30% 10%",
      background: "160 20% 98%",
      foreground: "160 30% 10%",
      border: "160 30% 85%",
      ring: "160 60% 40%",
    },
  },
];

export function getCSSVariables(theme: ThemePreset): string {
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