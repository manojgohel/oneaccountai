/* eslint-disable @typescript-eslint/no-explicit-any */
import getAiModels from "@/actions/ai/models";
import { getConversation } from "@/actions/conversation/conversation.action";
import HeaderComponent from "@/components/common/HeaderComponent";
import ChatComponent from "@/modules/ai/ChatComponent";

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

  const conversations = await getConversation(conversationId);

  return (
    <>
      <HeaderComponent />
      <div className="flex-1 overflow-y-auto">
        {/* {JSON.stringify(conversations, null, 2)} */}
        <ChatComponent models={models} conversationId={conversationId} conversations={conversations?.data} />
      </div>
    </>
  )
}
