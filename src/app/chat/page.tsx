import getAiModels from "@/actions/ai/models";
import ChatComponent from "@/modules/ai/ChatComponent";

export default async function ChatPage() {
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

    return <>
        <ChatComponent models={models} />
    </>
}