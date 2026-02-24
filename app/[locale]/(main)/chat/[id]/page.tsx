import { ChatWindow } from "@/components/chat-window";
import { auth } from "@/auth";
import { redirect } from "@/navigation";

export default async function ChatPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const session = await auth();
  if (!session) redirect({ href: "/login", locale: "en" });

  // In Next.js 15, params is a Promise. In 14, it's an object.
  // We can await it to be safe for future upgrades or if using 15.
  const resolvedParams = params;
  
  return <ChatWindow chatId={resolvedParams.id} />;
}
