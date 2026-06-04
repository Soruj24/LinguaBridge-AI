"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2 } from "lucide-react";
import type { Message } from "@/types/chat";

interface ChatSearchProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearch: (query: string) => void;
  searchResults: Message[];
  isSearching: boolean;
  onResultClick: (msgId: string) => void;
}

export function ChatSearch({
  isOpen, onClose, searchQuery, onSearch,
  searchResults, isSearching, onResultClick,
}: ChatSearchProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden border-b border-border/50 bg-background/80 backdrop-blur-xl"
        >
          <div className="px-3 md:px-5 py-3 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-xl bg-muted/50 border border-border/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={onClose}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {searchQuery && (
              <div className="max-h-40 overflow-y-auto space-y-1">
                {isSearching ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : searchResults.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-2">No results found</p>
                ) : (
                  searchResults.map((msg) => (
                    <button
                      key={msg._id}
                      onClick={() => onResultClick(msg._id)}
                      className="w-full text-left p-2 rounded-lg hover:bg-muted/50 transition-colors text-sm"
                    >
                      <span className="font-medium text-xs text-muted-foreground">
                        {msg.senderId?.name}
                      </span>
                      <p className="text-xs truncate text-foreground/80">{msg.originalText}</p>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
