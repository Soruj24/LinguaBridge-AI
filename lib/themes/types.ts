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
