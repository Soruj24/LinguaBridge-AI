"use client";

import { useState } from "react";
import { useRouter } from "@/navigation";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Loader2, UserPlus, Sparkles, MessageCircle } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

export function NewChatDialog({
  children,
  onChatCreated,
}: {
  children?: React.ReactNode;
  onChatCreated?: () => void;
}) {
  const t = useTranslations("NewChat");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<
    { _id: string; name: string; email: string; avatar: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const res = await axios.get(`/api/user/search?query=${query}`);
      setUsers(res.data);
    } catch (error) {
      console.error(error);
      toast.error(t("searchFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const startChat = async (userId: string) => {
    try {
      const res = await axios.post("/api/chat", { receiverId: userId });
      const chat = res.data;
      setOpen(false);
      if (onChatCreated) onChatCreated();
      router.push(`/chat/${chat._id}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(t("startFailed"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" className="w-full justify-start gap-2 mb-2">
            <UserPlus className="h-4 w-4" />
            {t("title")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              {t("title")}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <motion.form
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              onSubmit={handleSearch}
              className="relative"
            >
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("searchPlaceholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-20 bg-gradient-to-r from-muted/50 to-muted/30 focus:from-muted focus:to-muted/50 transition-all"
              />
              <Button
                type="submit"
                disabled={isLoading}
                size="sm"
                className="absolute right-1 top-1 h-8"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
              </Button>
            </motion.form>
            <ScrollArea className="h-[300px] pr-4">
              <AnimatePresence mode="wait">
                {users.length === 0 && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 shadow-inner">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">
                      {query ? t("noUsersFound") : t("searchHelp")}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="space-y-2">
                <AnimatePresence>
                  {users.map((user, index) => (
                    <motion.div
                      key={user._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 hover:bg-muted/80 rounded-xl cursor-pointer transition-all group hover:shadow-md active:scale-[0.98]"
                      onClick={() => startChat(user._id)}
                    >
                      <div className="relative">
                        <Avatar className="h-12 w-12 border-2 border-transparent group-hover:border-primary/30 transition-all">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                            {user.name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-semibold truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground bg-gradient-to-r from-primary/10 to-primary/5 px-3 py-1.5 rounded-full font-medium group-hover:from-primary/20 group-hover:to-primary/10 transition-all">
                        {(user as unknown as { language?: string }).language || "Chat"}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
