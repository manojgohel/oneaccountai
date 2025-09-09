/* eslint-disable @typescript-eslint/no-explicit-any */

import mongoose, { Schema } from 'mongoose';

const TokenUsageSchema = new Schema({
    inputTokens: { type: Number, default: 0 },
    outputTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    reasoningTokens: { type: Number, default: 0 },
    cachedInputTokens: { type: Number, default: 0 }
}, { _id: false });

const TokenUsageByModelSchema = new Schema({
    model: { type: String, required: true },
    usage: { type: TokenUsageSchema, required: true }
}, { _id: false });

const ConversationSchema = new Schema<any>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        default: 'New Conversation'
    },
    messages: {
        type: [Schema.Types.Mixed],
        required: true,
    },
    tokenUsage: {
        type: TokenUsageSchema,
        required: false
    },
    tokenUsageByModel: {
        type: [Schema.Types.Mixed],
        required: false,
    }
}, {
    timestamps: true
});

// Add indexes for better query performance
ConversationSchema.index({ userId: 1, timestamp: -1 });

const Conversation = mongoose.models.Conversation || mongoose.model<any>('Conversation', ConversationSchema);

export default Conversation;

