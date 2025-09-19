/* eslint-disable @typescript-eslint/no-explicit-any */
import { createConversation, getConversation, getConversationMetaData } from "@/actions/conversation/conversation.action";
import HeaderComponent from "@/components/common/HeaderComponent";
import ChatComponent from "@/modules/ai/ChatComponent";
import { Metadata } from "next";
import { redirect } from "next/navigation";

type Props = {
  params: { conversationId: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const paramsStore = await params;
  const conversationId = paramsStore.conversationId;

  if (conversationId === 'new') {
    return {
      title: "New Conversation - OneAccount AI",
      description: "Start a new AI conversation with OneAccount AI's premium models"
    };
  }

  const conversations = await getConversationMetaData(conversationId);
  const conversationName = conversations?.data?.name;

  return {
    title: conversationName ? `${conversationName} - OneAccount AI` : "Chat - OneAccount AI",
    description: conversationName ? `Continue your conversation: ${conversationName}` : "AI conversation powered by premium models",
  };
}

export default async function SecurePage({ params }: any) {
  const paramsStore = await params;

  const conversationId = paramsStore.conversationId;

  if (conversationId === 'new') {
    const newConversationId = await createConversation({ userId: 'demo-user' });
    return redirect(`/secure/${newConversationId}`);
  }

  const conversations = await getConversation(conversationId);

  return (
    <>
      <HeaderComponent model={conversations?.data?.model} description={conversations?.data?.name} />
      <div className="flex-1 overflow-y-auto">
        <ChatComponent conversationId={conversationId} conversations={conversations?.data} />
      </div>
    </>
  )
}
