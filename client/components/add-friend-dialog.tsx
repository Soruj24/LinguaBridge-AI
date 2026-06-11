"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AddFriendSearch } from "./add-friend-dialog/add-friend-search";
import { AddFriendList } from "./add-friend-dialog/add-friend-list";
import { useAddFriend } from "./add-friend-dialog/use-add-friend";

interface AddFriendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded: () => void;
}

export function AddFriendDialog({
  open,
  onOpenChange,
  onAdded,
}: AddFriendDialogProps) {
  const {
    query,
    setQuery,
    users,
    isSearching,
    sendingIds,
    handleSendRequest,
    resetState,
  } = useAddFriend(onAdded);

  useEffect(() => {
    if (!open) resetState();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Friends</DialogTitle>
          <DialogDescription>
            Search for people by name or email and send them a friend request.
          </DialogDescription>
        </DialogHeader>

        <AddFriendSearch query={query} onQueryChange={setQuery} />

        <AddFriendList
          query={query}
          users={users}
          isSearching={isSearching}
          sendingIds={sendingIds}
          onSendRequest={handleSendRequest}
        />
      </DialogContent>
    </Dialog>
  );
}
