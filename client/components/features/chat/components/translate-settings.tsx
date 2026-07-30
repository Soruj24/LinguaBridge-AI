"use client";

import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { languages } from "@/utils";

interface ChatTranslateSettingsProps {
  alwaysTranslate: boolean;
  autoTranslateLanguage: string | null;
  onToggle: (enabled: boolean, language?: string | null) => void;
}

export function ChatTranslateSettings({
  alwaysTranslate,
  autoTranslateLanguage,
  onToggle,
}: ChatTranslateSettingsProps) {
  return (
    <div className="space-y-3 pt-2 border-t">
      <h4 className="text-sm font-medium text-muted-foreground">Translation</h4>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <label className="text-sm font-medium">Always translate messages</label>
          <p className="text-[11px] text-muted-foreground">
            Messages from others will be automatically translated
          </p>
        </div>
        <Switch
          checked={alwaysTranslate}
          onCheckedChange={(checked) => {
            if (checked) {
              onToggle(true, autoTranslateLanguage || "en");
            } else {
              onToggle(false, null);
            }
          }}
        />
      </div>
      {alwaysTranslate && (
        <div className="flex items-center justify-between">
          <label className="text-sm">Target language</label>
          <Select
            value={autoTranslateLanguage || "en"}
            onValueChange={(val) => onToggle(true, val)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
