"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function PushNotificationButton() {
  const t = useTranslations("Notifications");
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
    checkExistingSubscription();
  }, []);

  const checkExistingSubscription = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setSubscription(sub);
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const subscribeToPush = async () => {
    if (!("PushManager" in window)) {
      toast.error("Push notifications not supported");
      return;
    }

    setIsSubscribing(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_KEY || ""
        ),
      });

      await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });

      setSubscription(sub);
      setPermission("granted");
      toast.success(t("enabled"));
    } catch (error) {
      console.error("Push subscription error:", error);
      toast.error(t("failed"));
    } finally {
      setIsSubscribing(false);
    }
  };

  const unsubscribeFromPush = async () => {
    if (!subscription) return;

    setIsSubscribing(true);
    try {
      await subscription.unsubscribe();
      await fetch("/api/notifications/unsubscribe", {
        method: "POST",
      });
      setSubscription(null);
      setPermission("default");
      toast.success(t("disabled"));
    } catch (error) {
      console.error("Unsubscribe error:", error);
    } finally {
      setIsSubscribing(false);
    }
  };

  const requestPermission = async () => {
    if (!("Notification" in window)) return;

    const perm = await Notification.requestPermission();
    setPermission(perm);
    
    if (perm === "granted") {
      await subscribeToPush();
    }
  };

  if (!("PushManager" in window)) {
    return null;
  }

  if (permission === "granted" && subscription) {
    return (
      <Button variant="outline" size="sm" onClick={unsubscribeFromPush} disabled={isSubscribing}>
        {isSubscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellOff className="h-4 w-4 mr-2" />}
        {t("disable")}
      </Button>
    );
  }

  if (permission === "denied") {
    return (
      <Button variant="outline" size="sm" disabled>
        <BellOff className="h-4 w-4 mr-2" />
        {t("blocked")}
      </Button>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={requestPermission} disabled={isSubscribing}>
      {isSubscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4 mr-2" />}
      {t("enable")}
    </Button>
  );
}

function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}