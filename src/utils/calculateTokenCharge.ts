import { getAiModelPricingByKey } from "@/actions/ai/models";

type Pricing = {
    input: number;               // USD per token
    output: number;              // USD per token
    cachedInputTokens: number;   // USD per token (cache read)
    cacheCreationInputTokens?: number; // USD per token (optional, not used here)
};

type Usage = {
    inputTokens?: number;
    outputTokens?: number;
    cachedInputTokens?: number;
};

export async function calculateTokenCharge(model: any, usage: Usage) {
    console.log("🚀💡💡💡💡💡=====> ~ calculateTokenCharge.ts:17 ~ calculateTokenCharge ~ usage:", usage);
    const inputTokens = usage.inputTokens ?? 0;
    const outputTokens = usage.outputTokens ?? 0;
    const cachedInputTokens = usage.cachedInputTokens ?? 0;

    const pricing: any = await getAiModelPricingByKey(model);

    // ensure cached tokens are not charged twice at input rate
    const nonCachedInput = Math.max(0, inputTokens - cachedInputTokens);

    // USD amount using JS numbers
    const costUSD =
        nonCachedInput * pricing.input +
        cachedInputTokens * pricing.cachedInputTokens +
        outputTokens * pricing.output;
    console.log("🚀💡💡💡💡💡=====> ~ calculateTokenCharge.ts:32 ~ calculateTokenCharge ~ costUSD:", costUSD);

    // convert to integer cents for storage/balance math
    const costCents = Math.round(costUSD * 100);

    return {
        costUSD,      // float for display
        costCents,    // integer for debiting balance
        breakdown: {
            nonCachedInput,
            cachedInputTokens,
            outputTokens,
        },
    };
}
