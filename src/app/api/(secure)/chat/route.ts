import { getConversation } from '@/actions/conversation/conversation.action';
import { convertToModelMessages, streamText, UIMessage } from 'ai';
import { nanoid } from 'nanoid';
import { cookies } from 'next/headers';
import saveMessage from './saveMessage';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const cookieStore = await cookies();
    const userId = cookieStore.get('_id')?.value;
    const {
        messages,
        model,
        webSearch = false,
        conversationId
    }: { messages: UIMessage[]; model: string; webSearch: boolean; conversationId: string | null } = await req.json();
    const modelMessages = convertToModelMessages(messages);
    const conversation = await getConversation(conversationId || '');
    if (!conversationId || !conversation) {
        return new Response('Conversation not found', { status: 404 });
    }
    const result = streamText({
        model: webSearch ? 'perplexity/sonar' : model,
        system: conversation?.data?.systemPrompt || 'You are a helpful assistant.',
        messages: modelMessages,
        async onFinish(response) {
            console.log("🚀💡💡💡💡💡=====> ~ route.ts:31 ~ onFinish ~ response:", response);
            const { totalUsage, content } = response;

            const userMessage = modelMessages[messages.length - 1];
            const requestMessage = {
                parts: userMessage?.content ? userMessage.content : [],
                id: nanoid(),
                role: userMessage?.role,
            };


            const responseMessage = {
                parts: content ? content : [],
                id: nanoid(),
                role: "assistant" as const,
                totalUsage,
                model
            };
            saveMessage({ id: conversationId, requestMessage, responseMessage, userId });
        },
        onError(error) {
            console.error('Error in chat route:', error);
        }
    });

    // send sources and reasoning back to the client
    return result.toUIMessageStreamResponse({
        sendSources: true,
        sendReasoning: true,
    });
}