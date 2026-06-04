"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, UserX, Loader2 } from "lucide-react";
import type { PendingRequest } from "@/types/sidebar";

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
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
          <UserPlus className="h-6 w-6 text-muted-foreground/50" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">No requests</p>
        <p className="text-xs text-muted-foreground/60 max-w-[180px] leading-relaxed">
          Search for people and send them a friend request
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {incomingRequests.length > 0 && (
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-2 px-1">
            Incoming ({incomingRequests.length})
          </h3>
          <div className="space-y-1">
            {incomingRequests.map((req) => (
              <div
                key={req._id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/30 border border-border/30"
              >
                <Avatar className="h-9 w-9 shrink-0 ring-2 ring-primary/10">
                  <AvatarImage src={req.user.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {req.user.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{req.user.name}</p>
                  <p className="text-xs text-muted-foreground/70 truncate">Sent you a request</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="sm"
                    className="h-7 w-7 rounded-lg p-0 bg-primary hover:bg-primary/90"
                    onClick={() => onAccept(req._id)}
                    disabled={acceptingIds.has(req._id)}
                  >
                    {acceptingIds.has(req._id) ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <UserCheck className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 rounded-lg p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onReject(req._id)}
                    disabled={rejectingIds.has(req._id)}
                  >
                    {rejectingIds.has(req._id) ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <UserX className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {outgoingRequests.length > 0 && (
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-2 px-1">
            Sent ({outgoingRequests.length})
          </h3>
          <div className="space-y-1">
            {outgoingRequests.map((req) => (
              <div
                key={req._id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl opacity-60 group"
              >
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarImage src={req.user.avatar} />
                  <AvatarFallback className="bg-muted-foreground/10 text-muted-foreground text-xs font-semibold">
                    {req.user.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{req.user.name}</p>
                  <p className="text-xs text-muted-foreground/50">Request pending</p>
                </div>
                <button
                  onClick={() => onCancelRequest(req._id)}
                  className="text-[10px] text-muted-foreground/40 hover:text-destructive italic opacity-0 group-hover:opacity-100 transition-all shrink-0"
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
