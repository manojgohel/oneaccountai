/* eslint-disable @typescript-eslint/no-explicit-any */

import mongoose, { Schema } from 'mongoose';

const TokenUsageSchema = new Schema({
    inputTokens: { type: Number, default: 0 },
    outputTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    reasoningTokens: { type: Number, default: 0 },
    cachedInputTokens: { type: Number, default: 0 }
}, { _id: false });

const ConversationSchema = new Schema<any>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        default: 'Unnamed Conversation'
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
        type: Schema.Types.Mixed, // Changed from Map to Mixed to allow nested structure
        required: false,
        default: {}
    },
    model: { type: String, default: 'openai/gpt-4o-mini' },
    systemPrompt: { type: String, default: '' },
    reduceToken: { type: Boolean, default: false },
}, {
    timestamps: true
});

// Add indexes for better query performance
ConversationSchema.index({ userId: 1, timestamp: -1 });

const Conversation = mongoose.models.Conversation || mongoose.model<any>('Conversation', ConversationSchema);

export default Conversation;

