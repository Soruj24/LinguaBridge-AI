"use client";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ImagePlay, Smile, Search, Sticker, Loader2 } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useChatApi } from "@/hooks/use-chat-api";

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

interface GifResult {
  id: string;
  url: string;
  title: string;
}

interface GifPickerProps {
  onSelect: (emoji: string) => void;
  onGifSelect: (url: string) => void;
}

type Tab = "emoji" | "gif";

export function GifPicker({ onSelect, onGifSelect }: GifPickerProps) {
  const { searchGifs } = useChatApi();
  const [tab, setTab] = useState<Tab>("emoji");
  const [activePack, setActivePack] = useState(0);
  const [search, setSearch] = useState("");
  const [gifSearch, setGifSearch] = useState("");
  const [gifs, setGifs] = useState<GifResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchGifs = useCallback(async (q: string) => {
    setIsLoading(true);
    try {
      const data = await searchGifs(q);
      setGifs(data.gifs || []);
    } catch {
      setGifs([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchGifs]);

  useEffect(() => {
    fetchGifs("");
  }, [fetchGifs]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchGifs(gifSearch);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [gifSearch, fetchGifs]);

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
        <div className="flex border-b">
          <button
            onClick={() => setTab("emoji")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium ${
              tab === "emoji" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
            }`}
          >
            <Smile className="h-3.5 w-3.5" />
            Emoji
          </button>
          <button
            onClick={() => setTab("gif")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium ${
              tab === "gif" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
            }`}
          >
            <ImagePlay className="h-3.5 w-3.5" />
            GIF
          </button>
        </div>

        {tab === "emoji" ? (
          <>
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
                  <button
                    key={i}
                    onClick={() => onSelect(emoji)}
                    className="p-2 text-xl hover:bg-muted rounded-lg cursor-pointer transition-all hover:scale-110"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="border-b p-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search GIFs..."
                  className="w-full pl-8 h-9 text-sm bg-muted/50 rounded-lg"
                  value={gifSearch}
                  onChange={(e) => setGifSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="p-2 max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : gifs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No GIFs found</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {gifs.map((gif) => (
                    <button
                      key={gif.id}
                      onClick={() => onGifSelect(gif.url)}
                      className="rounded-lg overflow-hidden border hover:border-primary transition-colors"
                    >
                      <img
                        src={gif.url}
                        alt={gif.title}
                        className="w-full h-24 object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
