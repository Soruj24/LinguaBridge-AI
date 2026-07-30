"use client";

import { Loader2, Monitor, Smartphone } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { LoginActivity } from "@/types/shared";
import type { ReactNode } from "react";

interface SecurityActivityListProps {
  activities: LoginActivity[];
  loading: boolean;
  onLoadMore: () => void;
}

function getDeviceIcon(deviceType: string): ReactNode {
  switch (deviceType) {
    case "mobile":
    case "tablet":
      return <Smartphone className="h-4 w-4" />;
    default:
      return <Monitor className="h-4 w-4" />;
  }
}

export function SecurityActivityList({ activities, loading, onLoadMore }: SecurityActivityListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Your recent login and security activity</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No recent activity
          </p>
        ) : (
          <div className="space-y-3">
            {activities.slice(0, 10).map((activity) => (
              <div
                key={activity._id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  activity.success ? "bg-muted/30" : "bg-red-50 dark:bg-red-950/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${activity.success ? "bg-background" : "bg-red-100 dark:bg-red-900/30"}`}>
                    {getDeviceIcon(activity.deviceType)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {activity.type === "login"
                        ? activity.success
                          ? "Successful login"
                          : `Failed login (${activity.failureReason})`
                        : activity.type === "2fa_enabled"
                        ? "2FA enabled"
                        : activity.type === "2fa_disabled"
                        ? "2FA disabled"
                        : activity.type
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.os} - {activity.browser}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.ipAddress && `IP: ${activity.ipAddress}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
            {activities.length > 10 && (
              <Button variant="outline" size="sm" className="w-full" onClick={onLoadMore}>
                Load More
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
