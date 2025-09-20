/* eslint-disable @typescript-eslint/no-explicit-any */

import mime from 'mime-types';
import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

// Separate function to generate message ID
const generateMessageId = (role: 'user' | 'assistant'): string => {
    return `${role}_${nanoid()}`;
};

// Helper function to generate conversation ID
const generateConversationId = (): string => {
    return `conv_${nanoid()}`;
};


function objectId(id: any) {
    if (!id) return null;
    try {
        return mongoose.Types.ObjectId.createFromHexString(id.toString());
    } catch (error) {
        console.error("Invalid ObjectId:", error);
        return null;
    }
}


function getMediaTypeFromUrl(url: string) {
    return mime.lookup(url) || 'application/octet-stream';
}

export { generateConversationId, generateMessageId, getMediaTypeFromUrl, objectId };

