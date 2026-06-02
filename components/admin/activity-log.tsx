"use client";

import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

export interface ActivityItem {
  _id: string;
  email: string;
  type: string;
  success: boolean;
  timestamp: string;
  browser?: string;
  os?: string;
  ipAddress?: string;
}

interface ActivityLogProps {
  activities: ActivityItem[];
  className?: string;
}

export function AdminActivityLog({ activities, className }: ActivityLogProps) {
  return (
    <div className={className}>
      <div className="space-y-3">
        {activities?.length ? (
          activities.map((activity) => (
            <div
              key={activity._id}
              className={`flex items-center gap-4 p-4 rounded-xl ${
                activity.success
                  ? "bg-green-50 dark:bg-green-950/20"
                  : "bg-red-50 dark:bg-red-950/20"
              }`}
            >
              <div
                className={`p-3 rounded-full ${activity.success ? "bg-green-100" : "bg-red-100"}`}
              >
                {activity.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">{activity.email}</p>
                <p className="text-sm text-muted-foreground">
                  {activity.type} • {activity.browser} on {activity.os} • IP:{" "}
                  {activity.ipAddress || "Unknown"}
                </p>
              </div>
              <div className="text-right">
                <Badge variant={activity.success ? "outline" : "destructive"}>
                  {activity.success ? "Success" : "Failed"}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(activity.timestamp), "MMM d, yyyy HH:mm")}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No activity recorded
          </p>
        )}
      </div>
    </div>
  );
}

interface ActivityListCompactProps {
  activities: ActivityItem[];
  className?: string;
}

export function AdminActivityListCompact({
  activities,
  className,
}: ActivityListCompactProps) {
  return (
    <div className={className}>
      <div className="space-y-3">
        {activities?.length ? (
          activities.map((activity) => (
            <div
              key={activity._id}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
            >
              <div
                className={`p-2 rounded-full ${activity.success ? "bg-green-100" : "bg-red-100"}`}
              >
                {activity.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{activity.email}</p>
                <p className="text-sm text-muted-foreground">
                  {activity.type} - {activity.browser} on {activity.os}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(activity.timestamp), {
                  addSuffix: true,
                })}
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No recent activity</p>
        )}
      </div>
    </div>
  );
}