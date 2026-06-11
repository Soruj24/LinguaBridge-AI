"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Folder as FolderIcon, FolderPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Folder } from "@/types/folders";

const COLOR_MAP: Record<string, string> = {
  gray: "bg-gray-400",
  blue: "bg-blue-500",
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  purple: "bg-purple-500",
  red: "bg-red-500",
  orange: "bg-orange-500",
  pink: "bg-pink-500",
};

interface FolderAssignPopoverProps {
  folders: Folder[];
  currentFolderId?: string | null;
  onAssign: (folderId: string | null) => void;
  onCreateFolder: (name: string) => void;
}

export function FolderAssignPopover({
  folders,
  currentFolderId,
  onAssign,
  onCreateFolder,
}: FolderAssignPopoverProps) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const handleCreate = () => {
    if (newName.trim()) {
      onCreateFolder(newName.trim());
      setNewName("");
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted shrink-0"
          onClick={(e) => e.stopPropagation()}
          title="Assign folder"
        >
          <FolderIcon className="h-3 w-3 text-muted-foreground/60" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" side="right" className="w-56 p-2">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground px-2 py-1">Move to folder</p>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAssign(null);
              setOpen(false);
            }}
            className={cn(
              "flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm hover:bg-muted transition-colors text-left",
              !currentFolderId && "bg-muted font-medium"
            )}
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
            No folder
          </button>

          {folders.map((folder) => (
            <button
              key={folder._id}
              onClick={(e) => {
                e.stopPropagation();
                onAssign(folder._id);
                setOpen(false);
              }}
              className={cn(
                "flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm hover:bg-muted transition-colors text-left",
                currentFolderId === folder._id && "bg-muted font-medium"
              )}
            >
              <span className={cn("h-2 w-2 rounded-full shrink-0", COLOR_MAP[folder.color] || COLOR_MAP.gray)} />
              <span className="truncate">{folder.name}</span>
            </button>
          ))}

          <div className="border-t my-1" />

          <div className="flex items-center gap-1 px-1">
            <Input
              placeholder="New folder..."
              className="h-7 text-xs px-2"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
            />
            <Button size="icon-xs" variant="ghost" onClick={handleCreate} disabled={!newName.trim()}>
              <FolderPlus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
