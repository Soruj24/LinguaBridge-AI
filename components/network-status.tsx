"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { toast } from "sonner";

export function NetworkStatus() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    function onOffline() {
      setIsOffline(true);
      toast.error("You are offline. Messages will be sent when you reconnect.", {
        icon: <WifiOff className="h-4 w-4" />,
        duration: Infinity,
        id: "offline-toast",
      });
    }

    function onOnline() {
      setIsOffline(false);
      toast.dismiss("offline-toast");
      toast.success("You are back online!", {
        duration: 3000,
      });
    }

    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);

    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-destructive text-destructive-foreground text-xs font-medium text-center py-1 z-50">
      You are currently offline. Check your internet connection.
    </div>
  );
}