import { ChatWindow } from "@/components/chat/chat-window";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ChatPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  let session;
  try {
    session = await auth();
  } catch {
    redirect("/en/login");
  }

  if (!session) redirect("/en/login");

  return <ChatWindow chatId={id} />;
}
