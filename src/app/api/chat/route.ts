import { convertToModelMessages, streamText, UIMessage } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const {
        messages,
        model,
        webSearch = false,
    }: { messages: UIMessage[]; model: string; webSearch: boolean } = await req.json();

    const result = streamText({
        model: webSearch ? 'openai/gpt-4.1' : model,
        system: 'You are a helpful assistant.',
        messages: convertToModelMessages(messages),
        onFinish(response) {
            const { totalUsage, text, } = response;
            console.log(`🚀💡💡💡💡💡=====> ~ route.ts:12 ~ POST `, {
                totalUsage, text, model
            });
        }
    });

    // send sources and reasoning back to the client
    return result.toUIMessageStreamResponse({
        sendSources: true,
        sendReasoning: true,
    });
}