import { useSession } from "next-auth/react";

export interface UserPreferences {
  lowBandwidth: boolean;
  reduceMotion: boolean;
  highContrast: boolean;
  autoPlayAudio: boolean;
}

export function usePreferences() {
  const { data: session } = useSession();

  const preferences: UserPreferences = {
    lowBandwidth: session?.user?.preferences?.lowBandwidth ?? false,
    reduceMotion: session?.user?.preferences?.reduceMotion ?? false,
    highContrast: session?.user?.preferences?.highContrast ?? false,
    autoPlayAudio: session?.user?.preferences?.autoPlayAudio ?? true,
  };

  return preferences;
}
