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
        system: conversation?.data?.systemPrompt || 'You are a helpful assistant. developed by OneAccount AI.',
        messages: modelMessages,
        async onFinish(response) {
            const { totalUsage, content } = response;

            const userMessage = modelMessages[messages.length - 1];
            const parts = Array.isArray(userMessage?.content)
                ? userMessage.content.map((part: any) => {
                    if (part.type === 'file' && part.data) {
                        // Replace 'data' with 'url' for file type
                        const { data, ...rest } = part;
                        return { ...rest, url: part.data };
                    }
                    return part;
                })
                : userMessage?.content || [];

            const requestMessage = {
                parts,
                id: nanoid(),
                role: userMessage?.role,
            };
            console.log("🚀💡💡💡💡💡=====> ~ route.ts:37 ~ onFinish ~ requestMessage:", JSON.stringify(requestMessage, null, 2));

            const responseMessage = {
                parts: content ? content : [],
                id: nanoid(),
                role: "assistant" as const,
                totalUsage,
                model
            };
            saveMessage({ id: conversationId, requestMessage, responseMessage, userId, model });
        },
        onError(error) {
            console.error('Error in chat route:', JSON.stringify(error, null, 2));
        }
    });

    // send sources and reasoning back to the client
    return result.toUIMessageStreamResponse({
        sendSources: true,
        sendReasoning: true,
    });
}