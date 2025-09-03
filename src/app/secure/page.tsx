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
      <HeaderComponent title="One Account AI" />
      <div className="flex flex-1 flex-col gap-4 px-4 py-10">
        <ChatComponent models={models} />
      </div>
    </>
  )
}
