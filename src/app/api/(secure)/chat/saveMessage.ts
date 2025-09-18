
/* eslint-disable @typescript-eslint/no-explicit-any */

import { saveConversation } from "@/actions/conversation/conversation.action";

const saveMessage = async ({ id: conversationId, requestMessage, responseMessage, userId }: any): Promise<any> => {
    console.log('Saving messages to conversation:', JSON.stringify({ conversationId, requestMessage, responseMessage, userId }));
    await saveConversation({ id: conversationId, content: requestMessage, userId });
    await saveConversation({ id: conversationId, content: responseMessage, userId });
    return { status: true }
};

export default saveMessage;
