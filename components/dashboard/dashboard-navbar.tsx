"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User, Bell, Search, Sparkles, Shield, UserCog, Loader2, ArrowRight } from "lucide-react";
import { Link, useRouter } from "@/navigation";
import { signOut } from "next-auth/react";
import { ModeToggle } from "@/components/mode-toggle";
import { ThemeSelector } from "@/components/theme-selector";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

interface SearchChat {
  _id: string;
  participants: { _id: string; name: string; email: string; avatar?: string }[];
  lastMessage?: { originalText: string };
}

export function DashboardNavbar() {
  const t = useTranslations('Dashboard');
  const { data: session } = useSession();
  const user = session?.user;
  const userRole = (user as { role?: "user" | "admin" })?.role;
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
      const res = await axios.get(`/api/chat?search=${encodeURIComponent(query)}`);
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
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
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
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex h-16 items-center border-b bg-background/80 backdrop-blur-xl shadow-sm px-4 md:px-6 sticky top-0 z-50"
    >
      <div className="flex-1 flex items-center gap-3">
        {/* Logo / Brand */}
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg hidden md:block bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            LinguaBridge
          </span>
        </div>
      </div>

      {/* Search (desktop) */}
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
                      const other = chat.participants.find((p) => p.email !== session?.user?.email);
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
                            <p className="text-sm font-medium truncate">{other?.name || "Unknown"}</p>
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
                    <p className="text-sm text-muted-foreground">No conversations found</p>
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

      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-9 w-9 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-950/30"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500" />
        </Button>
        <ThemeSelector variant="icon" />
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-xl p-0 hover:bg-violet-50 dark:hover:bg-violet-950/30">
              <Avatar className="h-9 w-9 border-2 border-violet-200 dark:border-violet-800">
                <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                <AvatarFallback className="bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-300 font-medium">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/settings">
                <User className="mr-2 h-4 w-4" />
                <span>{t('profile')}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>{t('settings')}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {userRole === "admin" && (
              <>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/admin">
                    <UserCog className="mr-2 h-4 w-4" />
                    Admin Panel
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/security">
                    <Shield className="mr-2 h-4 w-4" />
                    Security
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            {userRole !== "admin" && (
              <>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/security">
                    <Shield className="mr-2 h-4 w-4" />
                    Security
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t('logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}