/* eslint-disable @typescript-eslint/no-explicit-any */
import deepClone from "@/lib/deepClone";
import dbConnect from "@/lib/mongoose";
import Conversation from "@/models/Conversation";
import { objectId } from "@/utils/common";
import { cookies } from "next/headers";

export async function createConversation({ userId, name, messages = [] }: any) {
    try {
        // Connect to database
        await dbConnect();

        // Create new conversation
        const newConversation = new Conversation({
            userId,
            name: name || `New Conversation ${Date.now()}`,
            messages,
        });

        // Save the conversation
        const savedConversation = await newConversation.save();
        const record: any = deepClone(savedConversation);
        return record?._id || null;

    } catch (error) {
        console.error('Error creating conversation:', error);
        return { status: false, error: 'Failed to create conversation' };
    }
}

export async function saveConversation({ id, content, userId }: any) {
    try {
        // Connect to database
        await dbConnect();
        const tokenUsage = content?.totalUsage || null;
        const model = content?.model || null;
        // Find the conversation by _id and userId, then push content to messages array
        const updatedConversation = await Conversation.findOneAndUpdate(
            { _id: objectId(id), userId }, // Find by both _id and userId
            {
                model: model,
                $push: { messages: content },
                $inc: {
                    'tokenUsage.inputTokens': tokenUsage?.inputTokens || 0,
                    'tokenUsage.outputTokens': tokenUsage?.outputTokens || 0,
                    'tokenUsage.totalTokens': tokenUsage?.totalTokens || 0,
                    'tokenUsage.reasoningTokens': tokenUsage?.reasoningTokens || 0,
                    'tokenUsage.cachedInputTokens': tokenUsage?.cachedInputTokens || 0,
                    ...(model ? {
                        [`tokenUsageByModel.${model}.inputTokens`]: tokenUsage?.inputTokens || 0,
                        [`tokenUsageByModel.${model}.outputTokens`]: tokenUsage?.outputTokens || 0,
                        [`tokenUsageByModel.${model}.totalTokens`]: tokenUsage?.totalTokens || 0,
                        [`tokenUsageByModel.${model}.reasoningTokens`]: tokenUsage?.reasoningTokens || 0,
                        [`tokenUsageByModel.${model}.cachedInputTokens`]: tokenUsage?.cachedInputTokens || 0,
                    } : {})
                }
            }, // Push content to messages array
            { new: true } // Return the updated document
        );

        if (!updatedConversation) {
            console.log('Conversation not found or user not authorized');
            return { status: false, error: 'Conversation not found or user not authorized' };
        }

        return { status: true, data: deepClone(updatedConversation) };

    } catch (error) {
        console.error('Error saving conversation:', error);
        return { status: false, error: 'Failed to save conversation' };
    }
}

export async function getConversation(conversationId: string) {
    try {
        const cookiesStore = await cookies();
        const userId = cookiesStore.get('_id')?.value;
        await dbConnect();
        const conversations = await Conversation.findOne({ _id: objectId(conversationId), userId: objectId(userId) }).lean();
        return { status: true, data: deepClone(conversations) };
    } catch (error) {
        console.error('Error fetching conversations:', error);
        return { status: false, error: 'Failed to fetch conversations' };
    }
}