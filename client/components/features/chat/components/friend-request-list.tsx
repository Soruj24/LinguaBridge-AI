"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, UserX, Loader2, Clock } from "lucide-react";
import type { PendingRequest } from "@/types/shared";

interface RequestsListProps {
  incomingRequests: PendingRequest[];
  outgoingRequests: PendingRequest[];
  acceptingIds: Set<string>;
  rejectingIds: Set<string>;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onCancelRequest: (id: string) => void;
}

export function RequestsList({
  incomingRequests, outgoingRequests,
  acceptingIds, rejectingIds,
  onAccept, onReject, onCancelRequest,
}: RequestsListProps) {
  if (incomingRequests.length === 0 && outgoingRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-14 w-14 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <UserPlus className="h-7 w-7 text-muted-foreground/40" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">No pending requests</p>
        <p className="text-xs text-muted-foreground/60 max-w-[200px] leading-relaxed">
          Friend requests will appear here when someone wants to connect
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {incomingRequests.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
              Incoming
            </span>
            <span className="text-[10px] font-medium text-muted-foreground/40 bg-muted/50 px-2 py-0.5 rounded-full">
              {incomingRequests.length}
            </span>
          </div>
          <div className="space-y-2">
            {incomingRequests.map((req) => (
              <div
                key={req._id}
                className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-muted/20 transition-colors"
              >
                <Avatar className="h-11 w-11 shrink-0 ring-1 ring-border">
                  <AvatarImage src={req.user.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                    {req.user.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{req.user.name}</p>
                  <p className="text-xs text-muted-foreground/60 truncate">
                    {req.user.email}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    size="sm"
                    className="h-8 px-3 rounded-lg gap-1.5 text-xs font-medium"
                    onClick={() => onAccept(req._id)}
                    disabled={acceptingIds.has(req._id)}
                  >
                    {acceptingIds.has(req._id) ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <UserCheck className="h-3.5 w-3.5" />
                    )}
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-3 rounded-lg gap-1.5 text-xs font-medium text-muted-foreground border-muted-foreground/20 hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5"
                    onClick={() => onReject(req._id)}
                    disabled={rejectingIds.has(req._id)}
                  >
                    {rejectingIds.has(req._id) ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <UserX className="h-3.5 w-3.5" />
                    )}
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {outgoingRequests.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
              Sent
            </span>
            <span className="text-[10px] font-medium text-muted-foreground/40 bg-muted/50 px-2 py-0.5 rounded-full">
              {outgoingRequests.length}
            </span>
          </div>
          <div className="space-y-2">
            {outgoingRequests.map((req) => (
              <div
                key={req._id}
                className="flex items-center gap-3 p-3 rounded-xl border border-dashed bg-muted/10 opacity-70 hover:opacity-100 transition-opacity group"
              >
                <Avatar className="h-11 w-11 shrink-0">
                  <AvatarImage src={req.user.avatar} />
                  <AvatarFallback className="bg-muted-foreground/10 text-muted-foreground text-xs font-semibold">
                    {req.user.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{req.user.name}</p>
                  <p className="text-xs text-muted-foreground/50 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Awaiting response
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCancelRequest(req._id)}
                  className="h-7 px-2 rounded-lg text-[11px] font-medium text-muted-foreground/50 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all shrink-0"
                >
                  Cancel
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
