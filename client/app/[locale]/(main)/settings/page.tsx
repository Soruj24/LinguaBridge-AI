"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useSettings } from "@/hooks/use-settings";
import { SettingsAppearance, SettingsProfile, SettingsAccessibility, SettingsEmailNotifications, SettingsNotifications, SettingsData } from "@/components/settings";

export default function SettingsPage() {
  const s = useSettings();

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 pb-20 md:pb-6 [padding-bottom:env(safe-area-inset-bottom)]">
      <Card className="w-full max-w-md border-none shadow-none bg-transparent">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold">Settings</CardTitle>
          <CardDescription className="text-sm">
            Customize your experience and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <SettingsAppearance />
          <Form {...s.form}>
            <SettingsProfile form={s.form} onSubmit={s.onSubmit} isLoading={s.isLoading} />
            <SettingsEmailNotifications control={s.form.control} />
            <SettingsNotifications
              preferences={s.notificationPrefs}
              isSaving={s.isNotifLoading}
              onUpdate={s.updateNotificationPreferences}
            />
            <SettingsAccessibility control={s.form.control} />
          </Form>
          <SettingsData />
        </CardContent>
      </Card>
    </div>
  );
}
