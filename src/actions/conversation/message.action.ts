"use server";

import deepClone from "@/lib/deepClone";
import dbConnect from "@/lib/mongoose";
import Message from "@/models/Message";
import { objectId } from "@/utils/common";



export async function getMessages({ lastId, limit = 500, conversationId }: { lastId?: string; limit?: number; conversationId: string }): Promise<any> {
    try {
        await dbConnect();

        // Build the query
        const matchQuery: any = { conversationId: objectId(conversationId), deletedAt: null };

        if (lastId) {
            matchQuery._id = { $lt: objectId(lastId) };
        }

        const messages = (await Message.aggregate([
            { $match: matchQuery },
            { $sort: { createdAt: -1 } },
            { $limit: limit }
        ])).reverse();

        const hasMore = messages.length === limit;
        const nextCursor = messages.length > 0 ? messages[messages.length - 1]._id : null;

        return {
            status: true,
            messages: deepClone(messages),
            pagination: {
                hasMore,
                nextCursor: nextCursor?.toString(),
                limit,
                returned: messages.length

            }
        };
    } catch (error) {
        console.error('Error fetching messages with stats:', error);
        return { status: false, error: 'Failed to fetch messages' };
    }
}
