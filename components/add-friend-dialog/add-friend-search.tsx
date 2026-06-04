"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AddFriendSearchProps {
  query: string;
  onQueryChange: (value: string) => void;
}

export function AddFriendSearch({
  query,
  onQueryChange,
}: AddFriendSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
      <Input
        placeholder="Search people..."
        className="pl-10 h-10 bg-muted/40 border-border/30 focus:border-primary/40 rounded-xl"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        autoFocus
      />
      {query.length > 0 && (
        <button
          onClick={() => onQueryChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
