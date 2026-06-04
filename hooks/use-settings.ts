"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";
import { settingsSchema, type SettingsFormValues } from "@/lib/schemas/settings";

export function useSettings() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: "",
      preferredLanguage: "en",
      avatar: "",
      preferences: {
        lowBandwidth: false,
        reduceMotion: false,
        highContrast: false,
        autoPlayAudio: true,
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
      };
      form.reset({
        name: user.name || "",
        preferredLanguage: user.preferredLanguage || "en",
        avatar: user.avatar || "",
        preferences: {
          lowBandwidth: user.preferences?.lowBandwidth || false,
          reduceMotion: user.preferences?.reduceMotion || false,
          highContrast: user.preferences?.highContrast || false,
          autoPlayAudio: user.preferences?.autoPlayAudio ?? true,
        },
      });
    }
  }, [session, form]);

  async function onSubmit(values: SettingsFormValues) {
    setIsLoading(true);
    try {
      await axios.put("/api/user/update", values);
      await update({
        ...session,
        user: {
          ...session?.user,
          name: values.name,
          avatar: values.avatar,
          preferredLanguage: values.preferredLanguage,
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

  return { form, isLoading, onSubmit, session };
}
