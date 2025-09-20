
"use server";
import deepClone from "@/lib/deepClone";
import dbConnect from "@/lib/mongoose";
import { AiModel } from "@/models/AiModel";
import { gateway } from '@ai-sdk/gateway';

export default async function getAiModels() {
    await dbConnect();

    const availableModels = await gateway.getAvailableModels();
    const textModels = availableModels?.models?.filter((m) => m.modelType === 'language') || [];

    // Upsert each model into the database
    const upsertedModels = await Promise.all(
        textModels.map(async (model: any) => {
            const doc = await AiModel.findOneAndUpdate(
                { modelId: model.id },
                {
                    modelId: model.id,
                    name: model.name,
                    description: model.description,
                    modelType: model.modelType,
                    pricing: model.pricing,
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            return doc;
        })
    );

    return deepClone(upsertedModels);
}

export async function getAiModelPricingByKey(modelKey: string) {
    await dbConnect();
    const model = await AiModel.findOne({ modelId: modelKey });
    return model ? model.pricing : null;
}