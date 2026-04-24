"use client";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Smile, Search, Sticker } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const STICKER_PACKS = [
  {
    name: "Reactions",
    emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "😉", "😌", "😍", "🥰", "😘", "😋", "😛", "😜", "🤪", "😝", "🤗", "🤭", "😶", "😐", "😑", "😬", "😮", "😯", "😲", "😱", "🤯", "😩", "😫", "🥱", "😤", "😢", "😭", "😪", "😴", "😪"],
  },
  {
    name: "Love",
    emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "♥️"],
  },
  {
    name: "Gestures",
    emojis: ["👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "👇", "☝️", "👊", "✊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🙏"],
  },
  {
    name: "Nature",
    emojis: ["🌸", "🌺", "🌻", "🌹", "🌷", "🌱", "🌿", "🍀", "🍁", "🍃", "🍎", "🍓", "🍒", "🍑", "🍍", "🥝", "🍉", "🍋"],
  },
  {
    name: "Objects",
    emojis: ["💯", "🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "⚫", "⚪", "💤", "💢", "💥", "💡", "🔔", "🎵", "🎶", "⭐", "🌟", "✨", "💫"],
  },
];

interface StickerPickerProps {
  onSelect: (emoji: string) => void;
}

export function StickerPicker({ onSelect }: StickerPickerProps) {
  const [activePack, setActivePack] = useState(0);
  const [search, setSearch] = useState("");

  const filteredEmojis = search
    ? STICKER_PACKS.flatMap((pack) => pack.emojis).filter((e) => e.includes(search))
    : STICKER_PACKS[activePack].emojis;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl hover:bg-muted">
          <Sticker className="h-4 w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0 rounded-xl" align="start">
        <div className="border-b p-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search emoji..."
              className="w-full pl-8 h-9 text-sm bg-muted/50 rounded-lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {!search && (
          <div className="flex gap-1 p-2 border-b overflow-x-auto">
            {STICKER_PACKS.map((pack, i) => (
              <button
                key={pack.name}
                onClick={() => setActivePack(i)}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  activePack === i 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "hover:bg-muted text-lg"
                }`}
              >
                {pack.emojis[0]}
              </button>
            ))}
          </div>
        )}

        <div className="p-2 max-h-48 overflow-y-auto">
          <div className="grid grid-cols-8 gap-1">
            {filteredEmojis.map((emoji, i) => (
              <motion.button
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.01 }}
                onClick={() => onSelect(emoji)}
                className="p-2 text-xl hover:bg-muted rounded-lg cursor-pointer transition-all hover:scale-110"
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}