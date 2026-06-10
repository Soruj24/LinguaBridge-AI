"use client";

import { Bell, Moon, Volume2, Vibrate, Eye } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { NotificationPreferences } from "@/hooks/use-settings";

const NOTIFICATION_TYPES = [
  { value: "messages", label: "Messages in chats" },
  { value: "friend_requests", label: "Friend requests" },
  { value: "group_invites", label: "Group invites" },
  { value: "calls", label: "Calls" },
  { value: "security_alerts", label: "Security alerts" },
  { value: "system_updates", label: "System updates" },
] as const;

interface SettingsNotificationsProps {
  preferences: NotificationPreferences;
  isSaving: boolean;
  onUpdate: (data: Partial<NotificationPreferences>) => void;
}

export function SettingsNotifications({ preferences, isSaving, onUpdate }: SettingsNotificationsProps) {
  function toggleType(type: string) {
    const current = preferences.enabledTypes;
    const next = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onUpdate({ enabledTypes: next });
  }

  return (
    <div className="space-y-4 p-4 rounded-xl border bg-card">
      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <Bell className="h-4 w-4" />
        <span>In-App Notifications</span>
      </div>

      {/* Section 1: Notification Types */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
          Notification Types
        </Label>
        <div className="space-y-1.5">
          {NOTIFICATION_TYPES.map((nt) => (
            <label
              key={nt.value}
              className="flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer hover:bg-accent/50 transition-colors has-[:disabled]:opacity-50"
            >
              <input
                type="checkbox"
                className="size-4 rounded border-border accent-primary"
                checked={preferences.enabledTypes.includes(nt.value)}
                onChange={() => toggleType(nt.value)}
                disabled={isSaving}
              />
              <span className="text-sm">{nt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Section 2: Quiet Hours */}
      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Do Not Disturb</Label>
          </div>
          <Switch
            checked={preferences.doNotDisturb.enabled}
            onCheckedChange={(checked) =>
              onUpdate({ doNotDisturb: { ...preferences.doNotDisturb, enabled: checked } })
            }
            disabled={isSaving}
          />
        </div>
        {preferences.doNotDisturb.enabled && (
          <div className="flex items-center gap-3 pl-6">
            <div className="flex-1 space-y-1">
              <Label className="text-xs text-muted-foreground">Start Time</Label>
              <Input
                type="time"
                value={preferences.doNotDisturb.startTime}
                onChange={(e) =>
                  onUpdate({ doNotDisturb: { ...preferences.doNotDisturb, startTime: e.target.value } })
                }
                disabled={isSaving}
              />
            </div>
            <div className="flex-1 space-y-1">
              <Label className="text-xs text-muted-foreground">End Time</Label>
              <Input
                type="time"
                value={preferences.doNotDisturb.endTime}
                onChange={(e) =>
                  onUpdate({ doNotDisturb: { ...preferences.doNotDisturb, endTime: e.target.value } })
                }
                disabled={isSaving}
              />
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Sound & Vibration */}
      <div className="space-y-3">
        <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
          Sound & Vibration
        </Label>
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Notification sound</span>
            </div>
            <Select
              value={preferences.sound}
              onValueChange={(value) => onUpdate({ sound: value })}
              disabled={isSaving}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="chime">Chime</SelectItem>
                <SelectItem value="bell">Bell</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center justify-between rounded-lg border px-3 py-2.5 cursor-pointer hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-2">
              <Vibrate className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Vibration</span>
            </div>
            <Switch
              checked={preferences.vibration}
              onCheckedChange={(checked) => onUpdate({ vibration: checked })}
              disabled={isSaving}
            />
          </label>
          <label className="flex items-center justify-between rounded-lg border px-3 py-2.5 cursor-pointer hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Show message preview</span>
            </div>
            <Switch
              checked={preferences.showPreview}
              onCheckedChange={(checked) => onUpdate({ showPreview: checked })}
              disabled={isSaving}
            />
          </label>
        </div>
      </div>

      {isSaving && (
        <p className="text-xs text-muted-foreground text-right">Saving...</p>
      )}
    </div>
  );
}
