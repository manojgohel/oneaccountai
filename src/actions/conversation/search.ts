"use server";

import dbConnect from "@/lib/mongoose";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import { objectId } from "@/utils/common";
import { cookies } from "next/headers";

export interface SearchResult {
    _id: string;
    type: 'conversation' | 'message';
    title: string;
    content: string;
    conversationId: string;
    createdAt: Date;
    updatedAt: Date;
}

export async function searchConversationsAndMessages(query: string): Promise<{ status: boolean; data?: SearchResult[]; error?: string }> {
    try {
        if (!query || query.trim().length < 2) {
            return { status: true, data: [] };
        }

        await dbConnect();
        const cookiesStore = await cookies();
        const userId = cookiesStore.get('_id')?.value;

        if (!userId) {
            return { status: false, error: 'User not authenticated' };
        }

        // Create search conditions for partial word matching
        const searchWords = query.trim().split(/\s+/).filter(word => word.length > 0);
        const userIdObj = objectId(userId);

        // Search in conversations - match any word in name or systemPrompt
        const conversationConditions = searchWords.map(word => ({
            $or: [
                { name: { $regex: word, $options: 'i' } },
                { systemPrompt: { $regex: word, $options: 'i' } }
            ]
        }));

        // Try exact word match first
        let conversations = await Conversation.find({
            userId: userIdObj,
            deletedAt: null,
            $and: conversationConditions
        })
        .select('_id name systemPrompt createdAt updatedAt')
        .sort({ updatedAt: -1 })
        .limit(10)
        .lean();

        // If no exact matches, try partial matches
        if (conversations.length === 0) {
            conversations = await Conversation.find({
                userId: userIdObj,
                deletedAt: null,
                $or: [
                    { name: { $regex: query.trim(), $options: 'i' } },
                    { systemPrompt: { $regex: query.trim(), $options: 'i' } }
                ]
            })
            .select('_id name systemPrompt createdAt updatedAt')
            .sort({ updatedAt: -1 })
            .limit(10)
            .lean();
        }

        // Search in messages - match any word in text content or role
        const messageConditions = searchWords.map(word => ({
            $or: [
                { 'parts.text': { $regex: word, $options: 'i' } },
                { role: { $regex: word, $options: 'i' } }
            ]
        }));

        // Try exact word match first
        let messages = [];
        try {
            messages = await Message.find({
                deletedAt: null,
                $and: messageConditions
            })
            .populate('conversationId', 'name userId')
            .select('_id parts role conversationId createdAt updatedAt')
            .sort({ updatedAt: -1 })
            .limit(10)
            .lean();

            // If no exact matches, try partial matches
            if (messages.length === 0) {
                messages = await Message.find({
                    deletedAt: null,
                    $or: [
                        { 'parts.text': { $regex: query.trim(), $options: 'i' } },
                        { role: { $regex: query.trim(), $options: 'i' } }
                    ]
                })
                .populate('conversationId', 'name userId')
                .select('_id parts role conversationId createdAt updatedAt')
                .sort({ updatedAt: -1 })
                .limit(10)
                .lean();
            }
        } catch (populateError: any) {
            console.warn('Populate failed, trying without populate:', populateError.message);
            // Fallback: search without populate
            messages = await Message.find({
                deletedAt: null,
                $and: messageConditions
            })
            .select('_id parts role conversationId createdAt updatedAt')
            .sort({ updatedAt: -1 })
            .limit(10)
            .lean();
        }

        // Filter messages to only include those from user's conversations
        const userMessages = messages.filter((message: any) => {
            // If populate worked, check userId
            if (message.conversationId?.userId) {
                return message.conversationId.userId.toString() === userId;
            }
            // If populate failed, we need to check conversation ownership separately
            return true; // We'll filter this later
        });

        // Transform results
        const conversationResults: SearchResult[] = conversations.map((conv: any) => ({
            _id: conv._id.toString(),
            type: 'conversation',
            title: conv.name,
            content: conv.systemPrompt || 'No system prompt',
            conversationId: conv._id.toString(),
            createdAt: conv.createdAt,
            updatedAt: conv.updatedAt
        }));

        const messageResults: SearchResult[] = userMessages.map((msg: any) => {
            const textContent = msg.parts
                .filter((part: any) => part.text)
                .map((part: any) => part.text)
                .join(' ')
                .substring(0, 200);

            // Handle both populated and non-populated cases
            const conversationName = msg.conversationId?.name || 'Unknown Conversation';
            const conversationId = msg.conversationId?._id?.toString() || msg.conversationId?.toString();

            return {
                _id: msg._id.toString(),
                type: 'message',
                title: `${conversationName} - ${msg.role}`,
                content: textContent,
                conversationId: conversationId,
                createdAt: msg.createdAt,
                updatedAt: msg.updatedAt
            };
        });

        // Combine and sort by updatedAt
        const allResults = [...conversationResults, ...messageResults]
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 20); // Limit to 20 results total

        return { status: true, data: allResults };

    } catch (error: any) {
        console.error('Error searching conversations and messages:', error);
        return { status: false, error: `Failed to search: ${error.message}` };
    }
}
