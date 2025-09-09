/* eslint-disable @typescript-eslint/no-explicit-any */
import getAiModels from "@/actions/ai/models";
import { createConversation, getConversation } from "@/actions/conversation/conversation.action";
import HeaderComponent from "@/components/common/HeaderComponent";
import ChatComponent from "@/modules/ai/ChatComponent";
import { redirect } from "next/navigation";

export default async function SecurePage({ params }: any) {
  const paramsStore = await params;

  const conversationId = paramsStore.conversationId;
  const models = await getAiModels() || [
    {
      name: 'GPT 4o',
      value: 'openai/gpt-4o',
    },
    {
      name: 'Deepseek R1',
      value: 'deepseek/deepseek-r1',
    },
  ];;

  if (conversationId === 'new') {
    const newConversationId = await createConversation({ userId: 'demo-user' });
    return redirect(`/secure/${newConversationId}`);
  }

  const conversations = await getConversation(conversationId);

  return (
    <>
      <HeaderComponent />
      <div className="flex-1 overflow-y-auto">
        <ChatComponent models={models} conversationId={conversationId} conversations={conversations?.data} />
      </div>
    </>
  )
}
