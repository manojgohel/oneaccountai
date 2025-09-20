

import mongoose, { Schema } from 'mongoose';

// Define the Part schema
const PartSchema = new Schema({
    type: {
        type: String,
        required: true,
        enum: ['file', 'text']
    },
    mediaType: {
        type: String,
    },
    filename: {
        type: String,
    },
    data: {
        type: String,
    },
    url: {
        type: String,
    },
    text: {
        type: String,
    }
}, { _id: false });

// Define the main Message schema
const MessageSchema = new Schema<any>({
    conversationId: {
        type: Schema.Types.ObjectId,
        ref: 'conversations',
        required: true
    },
    parts: {
        type: [PartSchema],
        required: true,
        validate: {
            validator: function (parts: any[]) {
                return parts.length > 0;
            },
            message: 'A message must have at least one part'
        }
    },
    id: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        required: true,
        enum: ['user', 'assistant', 'system']
    },
    deletedAt: {
        type: Date,
        default: null
    },
    totalUsage: {
        type: Schema.Types.Mixed, // Changed from Map to Mixed to allow nested structure
        required: false,
        default: {}
    },
    model: { type: String, default: 'openai/gpt-4o-mini' },
}, {
    timestamps: true
});

// Add indexes for better performance
// MessageSchema.index({ conversationId: 1, createdAt: -1 });
// MessageSchema.index({ id: 1 });
// MessageSchema.index({ role: 1 });

const Message = mongoose.models.Message || mongoose.model<any>('Message', MessageSchema);

export default Message;
