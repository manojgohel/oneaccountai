/* eslint-disable @typescript-eslint/no-explicit-any */
import { createConversation, getConversation } from "@/actions/conversation/conversation.action";
import HeaderComponent from "@/components/common/HeaderComponent";
import ChatComponent from "@/modules/ai/ChatComponent";
import { redirect } from "next/navigation";

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
      <HeaderComponent model={conversations?.data?.model} />
      <div className="flex-1 overflow-y-auto">
        <ChatComponent conversationId={conversationId} conversations={conversations?.data} />
      </div>
    </>
  )
}
