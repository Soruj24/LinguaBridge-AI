import { Link } from "@/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Chat from "@/models/Chat";
import Message from "@/models/Message";
import { Globe, MessageSquare, Languages, Settings } from "lucide-react";

interface PageProps {
  params: Promise<{ locale: string; userId: string }>;
}

export default async function ProfilePage({ params }: PageProps) {
  const { userId } = await params;
  await connectDB();

  const user = await User.findById(userId).select("-password");
  if (!user) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>User not found</p>
      </div>
    );
  }

  const chatCount = await Chat.countDocuments({ participants: userId });
  const messageCount = await Message.countDocuments({
    $or: [{ senderId: userId }, { receiverId: userId }],
  });

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-2xl">{user.name?.[0]}</AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-2xl">{user.name}</CardTitle>
          <p className="text-muted-foreground">{user.email}</p>
          <div className="flex justify-center gap-2 mt-2">
            <Badge variant="outline" className="gap-1">
              <Globe className="h-3 w-3" />
              {user.preferredLanguage || "en"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <MessageSquare className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold">{chatCount}</p>
              <p className="text-xs text-muted-foreground">Conversations</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Languages className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold">{messageCount}</p>
              <p className="text-xs text-muted-foreground">Messages</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">About</h3>
            <p className="text-sm text-muted-foreground">
              {user.bio || "No bio yet"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Member since</p>
              <p className="font-medium">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "Unknown"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Last active</p>
              <p className="font-medium">
                {user.updatedAt
                  ? new Date(user.updatedAt).toLocaleDateString()
                  : "Unknown"}
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Link href={`/chat/new?user=${userId}`} className="flex-1">
              <Button className="w-full gap-2">
                <MessageSquare className="h-4 w-4" />
                Message
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}