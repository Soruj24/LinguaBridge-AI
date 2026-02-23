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
import { Search, Loader2, UserPlus } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function NewChatDialog({ children, onChatCreated }: { children?: React.ReactNode; onChatCreated?: () => void }) {
  const t = useTranslations('NewChat');
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
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
      toast.error(t('searchFailed'));
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
      toast.error(t('startFailed'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" className="w-full justify-start gap-2 mb-2">
            <UserPlus className="h-4 w-4" />
            {t('title')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder={t('searchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </form>
          <ScrollArea className="h-[300px] pr-4">
            {users.length === 0 && !isLoading && query && (
              <p className="text-center text-muted-foreground py-4">{t('noUsersFound')}</p>
            )}
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                  onClick={() => startChat(user._id)}
                >
                  <Avatar>
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <div className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                    {user.language}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
