"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */
import deepClone from "@/lib/deepClone";
import dbConnect from "@/lib/mongoose";
import Conversation from "@/models/Conversation";
import { objectId } from "@/utils/common";
import { cookies } from "next/headers";

export async function createConversation({ name, messages = [] }: any) {
    try {
        // Connect to database
        await dbConnect();
        const cookiesStore = await cookies();
        const userId = cookiesStore.get('_id')?.value;

        const existingConversation = await Conversation.findOne({ userId, messages: { $size: 0 } });
        if (existingConversation) {
            return deepClone(existingConversation._id);
        }
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

        // Parse the model to extract provider and model name
        // let providerModel = model;
        // let modelVariant = '';

        // if (model) {
        //     // Check if model has a variant (like "openai/gpt-4-mini" -> provider: "openai/gpt-4", variant: "mini")
        //     const parts = model.split('-');
        //     if (parts.length > 1) {
        //         // Extract the last part as variant if it looks like a variant
        //         const lastPart = parts[parts.length - 1];
        //         if (lastPart.match(/^(mini|turbo|instruct|preview|vision|\d+[kbm]?)$/i)) {
        //             modelVariant = lastPart;
        //             providerModel = parts.slice(0, -1).join('-');
        //         } else {
        //             modelVariant = 'default';
        //         }
        //     } else {
        //         modelVariant = 'default';
        //     }
        // }

        // Build the update object
        const updateFields: any = {
            model: model,
            $push: { messages: content },
            $inc: {
                'tokenUsage.inputTokens': tokenUsage?.inputTokens || 0,
                'tokenUsage.outputTokens': tokenUsage?.outputTokens || 0,
                'tokenUsage.totalTokens': tokenUsage?.totalTokens || 0,
                'tokenUsage.reasoningTokens': tokenUsage?.reasoningTokens || 0,
                'tokenUsage.cachedInputTokens': tokenUsage?.cachedInputTokens || 0,
            }
        };

        // Add tokenUsageByModel increments if model exists
        if (model && tokenUsage) {
            updateFields.$inc = {
                ...updateFields.$inc,
                [`tokenUsageByModel.${model}.inputTokens`]: tokenUsage?.inputTokens || 0,
                [`tokenUsageByModel.${model}.outputTokens`]: tokenUsage?.outputTokens || 0,
                [`tokenUsageByModel.${model}.totalTokens`]: tokenUsage?.totalTokens || 0,
                [`tokenUsageByModel.${model}.reasoningTokens`]: tokenUsage?.reasoningTokens || 0,
                [`tokenUsageByModel.${model}.cachedInputTokens`]: tokenUsage?.cachedInputTokens || 0,
            };
        }

        // Find the conversation by _id and userId, then push content to messages array
        const updatedConversation = await Conversation.findOneAndUpdate(
            { _id: objectId(id), userId }, // Find by both _id and userId
            updateFields,
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

export async function getConversations(lastId?: string, limit: number = 100) {
    try {
        const cookiesStore = await cookies();
        const userId = cookiesStore.get('_id')?.value;
        await dbConnect();

        // Build the query
        const matchQuery: any = { userId: objectId(userId) };

        if (lastId) {
            matchQuery._id = { $lt: objectId(lastId) };
        }

        const conversations = await Conversation.aggregate([
            { $match: matchQuery },
            {
                $project: {
                    name: 1,
                    tokenUsage: 1,
                    tokenUsageByModel: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    messageCount: { $size: { $ifNull: ["$messages", []] } },
                    // Get first and last message timestamps if needed
                    firstMessage: { $arrayElemAt: ["$messages", 0] },
                    lastMessage: { $arrayElemAt: ["$messages", -1] }
                }
            },
            { $sort: { _id: -1 } },
            { $limit: limit }
        ]);

        const hasMore = conversations.length === limit;
        const nextCursor = conversations.length > 0 ? conversations[conversations.length - 1]._id : null;

        return {
            conversations: deepClone(conversations),
            pagination: {
                hasMore,
                nextCursor: nextCursor?.toString(),
                limit,
                returned: conversations.length

            }
        };
    } catch (error) {
        console.error('Error fetching conversations with stats:', error);
        return { status: false, error: 'Failed to fetch conversations' };
    }
}

export async function updateConversation(conversationId: string, updateFields: any) {
    try {
        await dbConnect();
        const cookiesStore = await cookies();
        const userId = cookiesStore.get('_id')?.value;

        const updatedConversation = await Conversation.findOneAndUpdate(
            { _id: objectId(conversationId), userId: objectId(userId) },
            updateFields,
            { new: true }
        );

        if (!updatedConversation) {
            return { status: false, error: 'Conversation not found or user not authorized' };
        }

        return { status: true, data: deepClone(updatedConversation) };
    } catch (error) {
        console.error('Error updating conversation:', error);
        return { status: false, error: 'Failed to update conversation' };
    }
}

export async function deleteConversation(conversationId: string) {
    try {
        await dbConnect();
        const cookiesStore = await cookies();
        const userId = cookiesStore.get('_id')?.value;

        const result = await Conversation.deleteOne({
            _id: objectId(conversationId),
            userId: objectId(userId)
        });

        if (result.deletedCount === 0) {
            return { status: false, error: 'Conversation not found or user not authorized' };
        }

        return { status: true };
    } catch (error) {
        console.error('Error deleting conversation:', error);
        return { status: false, error: 'Failed to delete conversation' };
    }
}

export async function getMostRecentlyUpdatedConversationId() {
    try {
        await dbConnect();
        const cookiesStore = await cookies();
        const userId = cookiesStore.get('_id')?.value;

        const conversation = await Conversation.findOne({ userId: objectId(userId) })
            .sort({ updatedAt: -1 })
            .select('_id')
            .lean();
        const conversationClone = deepClone(conversation);
        return conversationClone ? conversationClone._id : null;
    } catch (error) {
        console.error('Error fetching most recently updated conversation:', error);
        return null;
    }
}