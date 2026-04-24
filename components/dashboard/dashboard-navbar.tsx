"use client";

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
import { LogOut, Settings, User, Bell, Search, Sparkles } from "lucide-react";
import { Link } from "@/navigation";
import { signOut } from "next-auth/react";
import { ModeToggle } from "@/components/mode-toggle";
import { ThemeSelector } from "@/components/theme-selector";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export function DashboardNavbar() {
  const t = useTranslations('Dashboard');
  const { data: session } = useSession();
  const user = session?.user;
  const firstName = user?.name?.split(" ")[0] || t('defaultUser');

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
      <div className="hidden md:flex items-center gap-2 mx-4 flex-1 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full h-9 pl-9 pr-4 rounded-xl bg-muted/50 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:bg-muted transition-all placeholder:text-muted-foreground"
          />
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