"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/resolvers";
import api from "@/lib/api";
import { toast } from "sonner";
import { settingsSchema, type SettingsFormValues } from "@/lib/schemas/settings";

export interface NotificationPreferences {
  enabledTypes: string[];
  doNotDisturb: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  sound: string;
  vibration: boolean;
  showPreview: boolean;
}

const defaultNotificationPreferences: NotificationPreferences = {
  enabledTypes: ["messages", "friend_requests", "group_invites", "calls", "security_alerts", "system_updates"],
  doNotDisturb: {
    enabled: false,
    startTime: "22:00",
    endTime: "08:00",
  },
  sound: "default",
  vibration: true,
  showPreview: true,
};

export function useSettings() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>(defaultNotificationPreferences);
  const [isNotifLoading, setIsNotifLoading] = useState(false);

  const fetchNotificationPreferences = useCallback(async () => {
    try {
      const res = await api.get("/api/user/notification-preferences");
      setNotificationPrefs(res.data);
    } catch {
      // Use defaults if fetch fails
    }
  }, []);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: "",
      preferredLanguage: "en",
      avatar: "",
      showLastSeen: true,
      showTypingIndicator: true,
      showReadReceipts: true,
      preferences: {
        lowBandwidth: false,
        reduceMotion: false,
        highContrast: false,
        autoPlayAudio: true,
      },
      emailPreferences: {
        marketing: true,
        security: true,
      },
    },
  });

  useEffect(() => {
    if (session?.user) {
      const user = session.user as {
        name?: string;
        preferredLanguage?: string;
        avatar?: string;
        preferences?: {
          lowBandwidth?: boolean;
          reduceMotion?: boolean;
          highContrast?: boolean;
          autoPlayAudio?: boolean;
        };
        emailPreferences?: {
          marketing?: boolean;
          security?: boolean;
        };
        notificationPreferences?: NotificationPreferences;
      };
      form.reset({
        name: user.name || "",
        preferredLanguage: user.preferredLanguage || "en",
        avatar: user.avatar || "",
        showLastSeen: (user as { showLastSeen?: boolean }).showLastSeen ?? true,
        showTypingIndicator: (user as { showTypingIndicator?: boolean }).showTypingIndicator ?? true,
        showReadReceipts: (user as { showReadReceipts?: boolean }).showReadReceipts ?? true,
        preferences: {
          lowBandwidth: user.preferences?.lowBandwidth || false,
          reduceMotion: user.preferences?.reduceMotion || false,
          highContrast: user.preferences?.highContrast || false,
          autoPlayAudio: user.preferences?.autoPlayAudio ?? true,
        },
        emailPreferences: {
          marketing: user.emailPreferences?.marketing ?? true,
          security: user.emailPreferences?.security ?? true,
        },
      });
      if (user.notificationPreferences) {
        setNotificationPrefs(user.notificationPreferences);
      } else {
        fetchNotificationPreferences();
      }
    }
  }, [session, form, fetchNotificationPreferences]);

  async function updateNotificationPreferences(data: Partial<NotificationPreferences>) {
    setIsNotifLoading(true);
    try {
      const res = await api.put("/api/user/notification-preferences", data);
      setNotificationPrefs(res.data);
      await update({
        ...session,
        user: {
          ...session?.user,
          notificationPreferences: res.data,
        },
      });
      toast.success("Notification preferences updated");
    } catch (error: unknown) {
      console.error(error);
      toast.error(
        (error as { response?: { data?: { error?: string } } }).response?.data?.error || "Failed to update notification preferences"
      );
    } finally {
      setIsNotifLoading(false);
    }
  }

  async function onSubmit(values: SettingsFormValues) {
    setIsLoading(true);
    try {
      await api.put("/api/user/update", values);
      await update({
        ...session,
        user: {
          ...session?.user,
          name: values.name,
          avatar: values.avatar,
          preferredLanguage: values.preferredLanguage,
          showLastSeen: values.showLastSeen,
          showTypingIndicator: values.showTypingIndicator,
          showReadReceipts: values.showReadReceipts,
        },
      });
      toast.success("Profile updated successfully");
    } catch (error: unknown) {
      console.error(error);
      toast.error(
        (error as { response?: { data?: { error?: string } } }).response?.data?.error || "Failed to update profile"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return { form, isLoading, onSubmit, session, notificationPrefs, isNotifLoading, updateNotificationPreferences };
}
