"use client";

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Chat, Message } from "@/types/shared";
import { ChatTranslateSettings } from "./translate-settings";

interface ChatInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chat: Chat | null;
  messages: Message[];
  alwaysTranslate: boolean;
  autoTranslateLanguage: string | null;
  onToggleAlwaysTranslate: (enabled: boolean, language?: string | null) => void;
}

export function ChatInfoDialog({
  open, onOpenChange, chat, messages,
  alwaysTranslate, autoTranslateLanguage, onToggleAlwaysTranslate,
}: ChatInfoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chat Info</DialogTitle>
          <DialogDescription>Details about this conversation</DialogDescription>
        </DialogHeader>
        {chat && (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Participants</h4>
              {chat.participants.map((p) => (
                <div key={p._id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={p.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {p.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-[11px] text-muted-foreground">{p.preferredLanguage}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Messages</span>
              <span className="font-medium">{messages.length}</span>
            </div>
            <ChatTranslateSettings
              alwaysTranslate={alwaysTranslate}
              autoTranslateLanguage={autoTranslateLanguage}
              onToggle={onToggleAlwaysTranslate}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
