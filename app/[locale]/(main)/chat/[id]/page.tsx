import { ChatWindow } from "@/components/chat-window";
import { auth } from "@/auth";
import { redirect } from "@/navigation";

export default async function ChatPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect("/login");

  // In Next.js 15, params is a Promise. In 14, it's an object.
  // We can await it to be safe for future upgrades or if using 15.
  const resolvedParams = await params;
  
  return <ChatWindow chatId={resolvedParams.id} />;
}
