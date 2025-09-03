import getAiModels from "@/actions/ai/models";
import HeaderComponent from "@/components/common/HeaderComponent";
import ChatComponent from "@/modules/ai/ChatComponent";

export default async function SecurePage() {
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

  return (
    <>
      <HeaderComponent />
      <div className="flex-1 overflow-y-auto">
        <ChatComponent models={models} />
      </div>
    </>
  )
}
