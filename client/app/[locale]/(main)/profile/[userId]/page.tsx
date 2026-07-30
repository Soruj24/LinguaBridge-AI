import { Link } from "@/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/auth";
import { Globe, MessageSquare, Languages, ArrowLeft, CalendarDays, Activity } from "lucide-react";
import { notFound } from "next/navigation";
import { ProfileActions } from "@/components/features/profile/components";
import { getProfileData } from "@/lib/services/profile.service";
import { ProfileStatusBadge } from "@/components/ui/profile-status-badge";

interface PageProps {
  params: Promise<{ locale: string; userId: string }>;
}

export default async function ProfilePage({ params }: PageProps) {
  const { userId } = await params;
  const session = await auth();

  let data;
  try {
    data = await getProfileData(userId, session?.user?.email ?? undefined);
  } catch {
    notFound();
  }

  const { user, isOwnProfile, friendStatus, friendshipId, chatCount, messageCount, hasBlocked, blockId } = data;

  return (
    <div className="min-h-full flex items-center justify-center p-4 pb-20 md:pb-6">
      <div className="w-full max-w-lg space-y-4">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <Card className="border shadow-lg overflow-hidden">
          <div className="h-24 bg-gradient-to-br from-primary/20 via-primary/10 to-background relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-blue-500/15 rounded-full blur-3xl" />
          </div>
          <CardHeader className="text-center -mt-12 relative z-10 pb-0">
            <div className="flex justify-center mb-3">
              <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold">
                  {(user.name?.[0] || "").toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-2xl">{user.name}</CardTitle>
            <p className="text-muted-foreground text-sm">{user.email}</p>
            <div className="flex justify-center gap-2 mt-2 flex-wrap">
              <Badge variant="outline" className="gap-1.5 rounded-full px-3 py-1">
                <Globe className="h-3 w-3 text-primary" />
                {user.preferredLanguage || "English"}
              </Badge>
              <ProfileStatusBadge
                userId={userId}
                initialIsOnline={user.isOnline}
                initialLastSeen={user.lastSeen}
                initialShowLastSeen={user.showLastSeen}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/10">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <p className="text-xl font-bold">{chatCount}</p>
                <p className="text-xs text-muted-foreground">Conversations</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-500/5 to-transparent border border-blue-500/10">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center mx-auto mb-2">
                  <Languages className="h-4 w-4 text-blue-500" />
                </div>
                <p className="text-xl font-bold">{messageCount}</p>
                <p className="text-xs text-muted-foreground">Messages</p>
              </div>
            </div>
            <div className="space-y-2 p-4 rounded-xl bg-muted/30">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                About
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {user.bio || "This user hasn't added a bio yet."}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-xl bg-muted/20">
                <p className="text-muted-foreground text-xs flex items-center gap-1 mb-1">
                  <CalendarDays className="h-3 w-3" />
                  Member since
                </p>
                <p className="font-medium">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })
                    : "Unknown"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-muted/20">
                <p className="text-muted-foreground text-xs flex items-center gap-1 mb-1">
                  <Activity className="h-3 w-3" />
                  Last active
                </p>
                <p className="font-medium">
                  {user.updatedAt
                    ? new Date(user.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                    : "Unknown"}
                </p>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <ProfileActions
                userId={userId}
                initialFriendStatus={friendStatus}
                isOwnProfile={isOwnProfile}
                friendshipId={friendshipId}
                isBlocked={hasBlocked}
                blockId={blockId}
                username={user.name}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
