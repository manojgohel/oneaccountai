/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import Conversation from "@/models/Conversation";
import { objectId } from "@/utils/common";
import { endOfDay, startOfDay, subDays } from "date-fns";
import { cookies } from "next/headers";

// Get token usage for the last N days, grouped by day
export async function getDailyTokenUsage(days = 7) {
    const cookiesStore = await cookies();
    const userId = cookiesStore.get("_id")?.value;

    const today = new Date();
    const startDate = subDays(startOfDay(today), days - 1);

    // Aggregate by day
    const daily = await Conversation.aggregate([
        {
            $match: {
                userId: objectId(userId),
                createdAt: { $gte: startDate, $lte: endOfDay(today) },
            },
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
                tokens: { $sum: "$tokenUsage.totalTokens" },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    // Fill missing days with 0
    const result: { date: string; tokens: number }[] = [];
    for (let i = 0; i < days; i++) {
        const d = subDays(today, days - 1 - i);
        const dateStr = d.toISOString().slice(0, 10);
        const found = daily.find((x) => x._id === dateStr);
        result.push({ date: dateStr, tokens: found ? found.tokens : 0 });
    }
    return result;
}

// Helper to recursively sum totalTokens for a model
function sumAllTokens(obj: any): { input: number; output: number; total: number } {
    if (!obj || typeof obj !== "object") return { input: 0, output: 0, total: 0 };
    let input = 0, output = 0, total = 0;
    if (typeof obj.inputTokens === "number") input += obj.inputTokens;
    if (typeof obj.outputTokens === "number") output += obj.outputTokens;
    if (typeof obj.totalTokens === "number") total += obj.totalTokens;
    for (const [key, value] of Object.entries(obj)) {
        if (key !== "inputTokens" && key !== "outputTokens" && key !== "totalTokens" && typeof value === "object" && value !== null) {
            const res = sumAllTokens(value);
            input += res.input;
            output += res.output;
            total += res.total;
        }
    }
    return { input, output, total };
}

export async function getTokenUsageByModel() {
    const cookiesStore = await cookies();
    const userId = cookiesStore.get("_id")?.value;

    const usage: Record<string, { input: number; output: number; total: number }> = {};
    const all = await Conversation.find({
        userId: objectId(userId),
    }, { tokenUsageByModel: 1 }).lean();
    for (const conv of all) {
        const byModel = conv.tokenUsageByModel || {};
        for (const [model, value] of Object.entries(byModel)) {
            const res = sumAllTokens(value);
            if (!usage[model]) usage[model] = { input: 0, output: 0, total: 0 };
            usage[model].input += res.input;
            usage[model].output += res.output;
            usage[model].total += res.total;
        }
    }
    return Object.entries(usage).map(([model, { input, output, total }]) => ({
        model,
        input,
        output,
        total,
    }));
}