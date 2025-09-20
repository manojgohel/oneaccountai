
/* eslint-disable @typescript-eslint/no-explicit-any */

import { saveConversation } from "@/actions/conversation/conversation.action";

const saveMessage = async ({ id: conversationId, requestMessage, responseMessage, userId, model }: any): Promise<any> => {
    await saveConversation({ id: conversationId, content: requestMessage, userId, model });
    await saveConversation({ id: conversationId, content: responseMessage, userId, model });
    return { status: true }
};

export default saveMessage;
