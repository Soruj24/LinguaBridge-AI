 "use client";
 
import { useEffect, useState, useCallback } from "react";
 import { useSession } from "next-auth/react";
 import { useRouter } from "@/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
 
type UserItem = {
   _id: string;
   name: string;
   email: string;
   avatar?: string;
   preferredLanguage?: string;
   role?: "user" | "admin";
   isActive?: boolean;
 };
 
type ChatItem = {
  _id: string;
  participants?: { name: string; email: string }[];
};

 export default function AdminPage() {
   const { data: session, status } = useSession();
   const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<"" | "user" | "admin">("");
  const [statusFilter, setStatusFilter] = useState<"" | "true" | "false">("");
  const [sortBy, setSortBy] = useState<"updatedAt" | "name" | "email">(
    "updatedAt",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [onConfirm, setOnConfirm] = useState<(() => void) | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Record<string, boolean>>(
    {},
  );
   const [search, setSearch] = useState("");
 
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
    if (session.user.role !== "admin") {
      router.push("/dashboard");
      return;
    }
    fetchUsers();
  }, [status, session, router, fetchUsers]);
 
  const fetchUsers = useCallback(async () => {
     try {
       setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      if (search) params.set("q", search);
      if (roleFilter) params.set("role", roleFilter);
      if (statusFilter) params.set("isActive", statusFilter);
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);
      const res = await fetch(`/api/users?${params.toString()}`);
      const json = await res.json();
      setUsers(json.data || []);
     } finally {
       setLoading(false);
     }
  }, [page, search, roleFilter, statusFilter, sortBy, sortOrder]);
 
  const fetchChats = useCallback(async () => {
    try {
      const res = await fetch("/api/chat?paginate=true&page=1&limit=20&sortBy=updatedAt");
      const json = await res.json();
      setChats(json.data || []);
    } catch {}
  }, []);

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchChats();
    }
  }, [session?.user?.role, fetchChats]);

   async function updateUser(payload: Record<string, unknown>) {
     await fetch("/api/user/update", {
       method: "PUT",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(payload),
     });
     await fetchUsers();
   }
 
  function confirm(actionText: string, action: () => void) {
    setConfirmText(actionText);
    setOnConfirm(() => action);
    setConfirmOpen(true);
  }
  function promote(user: UserItem) {
    confirm(`Promote ${user.email} to admin?`, () =>
      updateUser({ targetUserId: user._id, role: "admin" }),
    );
  }
  function demote(user: UserItem) {
    confirm(`Demote ${user.email} to user?`, () =>
      updateUser({ targetUserId: user._id, role: "user" }),
    );
  }
  function toggleActive(user: UserItem) {
    const next = !(user.isActive ?? true);
    confirm(`${next ? "Enable" : "Disable"} ${user.email}?`, () =>
      updateUser({ targetUserId: user._id, isActive: next }),
    );
  }
  function deleteUser(user: UserItem) {
    confirm(`Delete user ${user.email}? This cannot be undone.`, () =>
      updateUser({ targetUserId: user._id, deleteUser: true }),
    );
  }
  function toggleSelectUser(id: string) {
    setSelectedUsers((prev) => ({ ...prev, [id]: !prev[id] }));
  }
  async function bulkAction(
    action: "promote" | "demote" | "enable" | "disable",
  ) {
    const ids = Object.keys(selectedUsers).filter((id) => selectedUsers[id]);
    if (!ids.length) return;
    for (const id of ids) {
      if (action === "promote") await updateUser({ targetUserId: id, role: "admin" });
      if (action === "demote") await updateUser({ targetUserId: id, role: "user" });
      if (action === "enable") await updateUser({ targetUserId: id, isActive: true });
      if (action === "disable") await updateUser({ targetUserId: id, isActive: false });
    }
    setSelectedUsers({});
    await fetchUsers();
  }
 
   const filtered = users.filter((u) => {
     const q = search.toLowerCase();
     return (
       u.name?.toLowerCase().includes(q) ||
       u.email?.toLowerCase().includes(q) ||
       (u.preferredLanguage ?? "").toLowerCase().includes(q)
     );
   });
 
   return (
     <div className="p-6 space-y-6">
       <div className="flex items-center justify-between">
         <h1 className="text-2xl font-semibold">Admin</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchUsers} disabled={loading}>
            Refresh Users
          </Button>
          <Button variant="outline" onClick={fetchChats}>
            Refresh Chats
          </Button>
        </div>
       </div>
      <div className="flex gap-3 items-center">
         <Input
           placeholder="Search users..."
           value={search}
           onChange={(e) => setSearch(e.target.value)}
         />
        <Select
          value={roleFilter}
          onValueChange={(v) => setRoleFilter(v as "" | "user" | "admin")}
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as "" | "true" | "false")}
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </Select>
        <Select
          value={sortBy}
          onValueChange={(v) =>
            setSortBy(v as "updatedAt" | "name" | "email")
          }
        >
          <option value="updatedAt">Updated</option>
          <option value="name">Name</option>
          <option value="email">Email</option>
        </Select>
        <Select
          value={sortOrder}
          onValueChange={(v) => setSortOrder(v as "asc" | "desc")}
        >
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </Select>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={() => bulkAction("promote")}>
            Bulk Promote
          </Button>
          <Button variant="outline" onClick={() => bulkAction("demote")}>
            Bulk Demote
          </Button>
          <Button variant="outline" onClick={() => bulkAction("enable")}>
            Bulk Enable
          </Button>
          <Button variant="outline" onClick={() => bulkAction("disable")}>
            Bulk Disable
          </Button>
        </div>
       </div>
 
       <div className="grid gap-3">
         {filtered.map((u) => (
           <div
             key={u._id}
             className="flex items-center justify-between rounded border p-3 bg-card"
           >
             <div className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={!!selectedUsers[u._id]}
                onChange={() => toggleSelectUser(u._id)}
              />
               <Avatar className="h-8 w-8">
                 <AvatarImage src={u.avatar} />
                 <AvatarFallback>{u.name?.[0] ?? "U"}</AvatarFallback>
               </Avatar>
               <div>
                 <div className="font-medium">{u.name}</div>
                 <div className="text-sm text-muted-foreground">
                   {u.email} • {u.preferredLanguage ?? "en"}
                 </div>
                 <div className="text-xs">
                   Role: {u.role ?? "user"} • Status:{" "}
                   {(u.isActive ?? true) ? "Active" : "Inactive"}
                 </div>
               </div>
             </div>
             <div className="flex items-center gap-2">
               {(u.role ?? "user") === "admin" ? (
                 <Button variant="secondary" onClick={() => demote(u)}>
                   Demote
                 </Button>
               ) : (
                 <Button onClick={() => promote(u)}>Promote</Button>
               )}
               <Button variant="outline" onClick={() => toggleActive(u)}>
                 {(u.isActive ?? true) ? "Disable" : "Enable"}
               </Button>
               <Button variant="destructive" onClick={() => deleteUser(u)}>
                 Delete
               </Button>
             </div>
           </div>
         ))}
         {!filtered.length && (
           <div className="text-sm text-muted-foreground">No users found.</div>
         )}
         <div className="flex items-center gap-2">
           <Button
             variant="outline"
             disabled={page <= 1}
             onClick={() => {
               setPage((p) => Math.max(1, p - 1));
               fetchUsers();
             }}
           >
             Prev
           </Button>
           <Button
             variant="outline"
             onClick={() => {
               setPage((p) => p + 1);
               fetchUsers();
             }}
           >
             Next
           </Button>
         </div>
       </div>
 
       <div className="space-y-3">
         <h2 className="text-lg font-semibold">Chats</h2>
         {chats.map((c: ChatItem) => (
           <div
             key={c._id}
             className="flex items-center justify-between rounded border p-3 bg-card"
           >
             <div className="flex items-center gap-3">
               <div>
                 <div className="font-medium">
                   {c.participants?.map((p) => p.name).join(", ")}
                 </div>
                 <div className="text-sm text-muted-foreground">
                   {c.participants?.map((p) => p.email).join(", ")}
                 </div>
               </div>
             </div>
             <div className="flex items-center gap-2">
               <Button
                 variant="destructive"
                 onClick={() =>
                   confirm("Delete this chat? This cannot be undone.", async () => {
                     await fetch(`/api/chat/${c._id}`, { method: "DELETE" });
                     await fetchChats();
                   })
                 }
               >
                 Delete Chat
               </Button>
             </div>
           </div>
         ))}
         {!chats.length && (
           <div className="text-sm text-muted-foreground">No chats found.</div>
         )}
       </div>
 
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmText}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmOpen(false);
                onConfirm?.();
              }}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
     </div>
   );
 }
