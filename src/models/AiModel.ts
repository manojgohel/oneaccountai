import mongoose, { Document, Model, Schema } from "mongoose";

export interface IAiModel extends Document {
    modelId: string;
    name: string;
    description?: string;
    modelType: string;
    pricing?: {
        input?: number;
        output?: number;
        cachedInputTokens?: number;
        cacheCreationInputTokens?: number;
    };
}

const AiModelSchema: Schema = new Schema({
    modelId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: String,
    modelType: { type: String, required: true },
    pricing: {
        input: Number,
        output: Number,
        cachedInputTokens: Number,
        cacheCreationInputTokens: Number,
    },
});

export const AiModel: Model<IAiModel> =
    mongoose.models.AiModel || mongoose.model<IAiModel>("AiModel", AiModelSchema);