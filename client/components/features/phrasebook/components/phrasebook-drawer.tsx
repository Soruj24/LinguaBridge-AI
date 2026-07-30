"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Trash2, Search, X } from "lucide-react";
import { usePhrasebook } from "@/components/features/phrasebook/hooks/use-phrasebook";
import { getLanguageFlag } from "@/utils/helpers";
import type { PhrasebookEntry } from "@/types/shared";

interface PhrasebookDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English", es: "Spanish", fr: "French", de: "German",
  it: "Italian", pt: "Portuguese", ru: "Russian", ja: "Japanese",
  ko: "Korean", zh: "Chinese", ar: "Arabic", hi: "Hindi",
  bn: "Bengali", pa: "Punjabi", ta: "Tamil", th: "Thai",
  vi: "Vietnamese", nl: "Dutch", pl: "Polish", tr: "Turkish",
};

function EntryCard({ entry, onDelete }: { entry: PhrasebookEntry; onDelete: (id: string) => void }) {
  return (
    <div className="group relative rounded-lg border bg-card p-3 text-sm">
      <div className="text-xs text-muted-foreground mb-1.5">
        {getLanguageFlag(entry.languageFrom)} {LANGUAGE_NAMES[entry.languageFrom] || entry.languageFrom}
        {" → "}
        {getLanguageFlag(entry.languageTo)} {LANGUAGE_NAMES[entry.languageTo] || entry.languageTo}
      </div>
      <div className="font-medium text-foreground mb-0.5">{entry.originalText}</div>
      <div className="text-muted-foreground text-xs">{entry.translatedText}</div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] text-muted-foreground">
          {new Date(entry.createdAt).toLocaleDateString()}
        </span>
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex gap-1">
            {entry.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[9px] h-4 px-1.5">{tag}</Badge>
            ))}
          </div>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-1.5 right-1.5 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
        onClick={() => onDelete(entry._id)}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}

export function PhrasebookDrawer({ open, onOpenChange }: PhrasebookDrawerProps) {
  const { entries, isLoading, search, setSearch, deleteEntry } = usePhrasebook();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[380px] sm:max-w-[380px] p-0 flex flex-col">
        <SheetHeader className="px-4 pt-4 pb-2 border-b shrink-0">
          <div className="flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            <SheetTitle>Phrasebook</SheetTitle>
          </div>
        </SheetHeader>

        <div className="px-4 py-2 shrink-0 space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search phrasebook..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1 px-4 py-2">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Bookmark className="h-8 w-8 mb-2" />
              <p className="text-sm">No saved translations yet</p>
              <p className="text-xs mt-1">Save translated messages to build your phrasebook</p>
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry) => (
                <EntryCard key={entry._id} entry={entry} onDelete={deleteEntry} />
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
