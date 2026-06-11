"use client";

import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const TONES = [
  { label: "Formal", icon: "👔" },
  { label: "Casual", icon: "😎" },
  { label: "Professional", icon: "💼" },
  { label: "Friendly", icon: "😊" },
  { label: "Concise", icon: "✂️" },
];

interface ChatRewriteDropdownProps {
  disabled: boolean;
  isRewriting: boolean;
  onRewrite: (tone: string) => void;
}

export function ChatRewriteDropdown({ disabled, isRewriting, onRewrite }: ChatRewriteDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost" size="icon"
          className="h-11 w-11 rounded-xl hover:bg-muted/50 hidden sm:inline-flex"
          disabled={disabled}
          title="Rewrite"
        >
          <Wand2 className={cn("h-4 w-4", isRewriting ? "animate-spin text-primary" : "text-muted-foreground/70")} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 p-1">
        {TONES.map(({ label, icon }) => (
          <DropdownMenuItem key={label} onClick={() => onRewrite(label)} className="cursor-pointer rounded-md">
            <span className="mr-2 text-base">{icon}</span>
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
