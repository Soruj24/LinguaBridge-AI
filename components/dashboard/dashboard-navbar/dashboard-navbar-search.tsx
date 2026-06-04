"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "@/navigation";
import { useSession } from "next-auth/react";
import { Search, ArrowRight, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

interface SearchChat {
  _id: string;
  participants: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  }[];
  lastMessage?: { originalText: string };
}

export function DashboardNavbarSearch() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchChat[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchSearchResults = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      setIsSearching(true);
      const res = await axios.get(
        `/api/chat?search=${encodeURIComponent(query)}`,
      );
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setSearchResults(data.slice(0, 6));
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchSearchResults(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchSearchResults]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(e.target as Node)
      ) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSelectChat = (chatId: string) => {
    setSearchOpen(false);
    setSearchQuery("");
    router.push(`/chat/${chatId}`);
  };

  return (
    <div className="hidden md:flex items-center gap-2 mx-4 flex-1 max-w-md" ref={searchRef}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search conversations..."
          className="w-full h-9 pl-9 pr-4 rounded-xl bg-muted/50 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-muted transition-all placeholder:text-muted-foreground cursor-pointer"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSearchOpen(true);
          }}
          onFocus={() => setSearchOpen(true)}
        />
        <AnimatePresence>
          {searchOpen && (searchQuery || searchResults.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute top-full mt-2 left-0 right-0 bg-card rounded-xl border shadow-xl z-50 overflow-hidden"
            >
              {isSearching ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="py-1">
                  {searchResults.map((chat) => {
                    const other = chat.participants.find(
                      (p) => p.email !== session?.user?.email,
                    );
                    return (
                      <button
                        key={chat._id}
                        onClick={() => handleSelectChat(chat._id)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={other?.avatar} />
                          <AvatarFallback className="text-xs">
                            {other?.name?.[0]?.toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {other?.name || "Unknown"}
                          </p>
                          {chat.lastMessage && (
                            <p className="text-xs text-muted-foreground truncate">
                              {chat.lastMessage.originalText}
                            </p>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </button>
                    );
                  })}
                </div>
              ) : searchQuery ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Search className="h-6 w-6 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No conversations found
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Try a different search term
                  </p>
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
