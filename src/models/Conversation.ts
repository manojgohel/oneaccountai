import mongoose, { Document, Schema } from 'mongoose';

interface IConversation extends Document {
    userId: mongoose.Types.ObjectId;
    role: 'user' | 'assistant' | 'system';
    content: string | Array<{
        type: 'text' | 'image';
        text?: string;
        image?: string;
    }>;
    timestamp?: Date;
    images?: string[];
    answerIn?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'assistant', 'system'],
        required: true
    },
    content: {
        type: Schema.Types.Mixed,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    images: [{
        type: String
    }],
    answerIn: {
        type: String,
    }
}, {
    timestamps: true
});

// Add index for better query performance
ConversationSchema.index({ userId: 1, timestamp: -1 });
ConversationSchema.index({ userId: 1, role: 1, timestamp: -1 });

const Conversation = mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);

export default Conversation;
export type { IConversation };
