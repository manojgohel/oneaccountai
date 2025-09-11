/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import getAiModels from "@/actions/ai/models";
import { updateConversation } from "@/actions/conversation/conversation.action";
import { useGlobalContext } from "@/providers/context-provider";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import * as React from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";

// const models = [
//     {
//         value: "gpt-3.5-turbo",
//         title: "GPT-3.5 Turbo",
//         description: "Fast, cost-effective, and suitable for most tasks.",
//         price: {
//             input: "$0.50",
//             output: "$1.50",
//             thinking: "$0.00",
//         },
//     },
//     {
//         value: "gpt-4",
//         title: "GPT-4",
//         description: "More capable, better reasoning, higher cost.",
//         price: {
//             input: "$10.00",
//             output: "$30.00",
//             thinking: "$0.00",
//         },
//     },
//     {
//         value: "gpt-4o",
//         title: "GPT-4o",
//         description: "Latest model, optimized for speed and quality.",
//         price: {
//             input: "$5.00",
//             output: "$15.00",
//             thinking: "$0.00",
//         },
//     },
// ];

export default function ModelSelection({ model, description }: { model?: string, description?: string }) {
    const [selectedModel, setSelectedModel] = React.useState(model || "openai/gpt-4o-mini");
    const [search, setSearch] = React.useState("");
    const [models, setModels] = React.useState<Array<any>>([]);

    const params = useParams();

    const { setState } = useGlobalContext();
    const { status, data: modelsData, isError } = useQuery({
        queryKey: ['ai-models'],
        queryFn: getAiModels,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    function convertCurrency(input: string | number): string {
        const num = typeof input === "number" ? input : parseFloat(input);
        if (!isFinite(num) || isNaN(num)) return "0.00";
        const scaled = num * 1_000_000;
        const scaledAmount = scaled.toFixed(2);
        const finalAmount = Number(scaledAmount) * Number(process.env.PRICE_X);
        return finalAmount.toFixed(2);
    }


    React.useEffect(() => {
        if (status === 'success' && modelsData) {
            const formattedModels = modelsData.map((model: any) => ({
                value: model.modelId,
                title: model.name,
                description: model.description || "No description available.",
                price: {
                    input: model.pricing ? `$${convertCurrency(model.pricing.input)}/1M` : "N/A",
                    output: model.pricing ? `$${convertCurrency(model.pricing.output)}/1M` : "N/A",
                    thinking: model.pricing && model.pricing.cachedInputTokens ? `$${convertCurrency(model.pricing.cachedInputTokens)}/1M` : "N/A",
                },
            }));
            setModels(formattedModels);
            // If the currently selected model is not in the new list, reset to the first model
            if (!formattedModels.find((m: any) => m.value === selectedModel) && formattedModels.length > 0) {
                setSelectedModel(formattedModels[0].value);
                setState((prev: any) => ({ ...prev, model: formattedModels[0].value }));
            }
        }
    }, [status, modelsData, selectedModel]);

    const selected = models.find((m) => m.value === selectedModel);

    const filteredModels = models.filter(
        (model) =>
            model.title.toLowerCase().includes(search.toLowerCase()) ||
            model.description.toLowerCase().includes(search.toLowerCase())
    );

    const { mutate: updateConversationModel } = useMutation({
        mutationFn: ({ conversationId, model }: { conversationId: string; model: string }) =>
            updateConversation(conversationId, { model }),
    });

    const handleModelSelect = (value: string) => () => {
        setSelectedModel(value);
        setState((prev: any) => ({ ...prev, model: value }));
        updateConversationModel({ conversationId: params?.conversationId as string, model: value });
    };
    return (
        <>
            {/* {JSON.stringify(params?.conversationId)} */}
            <div className="max-w-xs">
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="text-left cursor-pointer bg-transparent border-0 p-0"
                            disabled={status === 'pending'}
                        >
                            <div className="flex flex-col max-w-xs">
                                <div className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 truncate whitespace-nowrap overflow-hidden max-w-xs">
                                    {status === 'pending' ? (
                                        <span>Loading models...</span>
                                    ) : (
                                        selected?.title
                                    )}
                                </div>
                                <div className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs overflow-hidden whitespace-nowrap">
                                    {description
                                        ?.split(" ")
                                        .slice(0, 5)
                                        .join(" ")}
                                    {description && description.split(" ").length > 5 ? "..." : ""}
                                </div>
                            </div>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="start"
                        className="min-w-xs max-w-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-lg p-0 flex flex-col"
                    >
                        {/* Sticky Search Input */}
                        <div className="p-2 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 sticky top-0 z-10">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search models..."
                                className="w-full px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 focus:outline-none"
                                autoFocus
                                disabled={status === 'pending'}
                            />
                        </div>
                        {/* Scrollable List */}
                        <div className="max-h-64 overflow-y-auto">
                            {status === 'pending' ? (
                                <div className="px-4 py-3 text-neutral-500 dark:text-neutral-400 text-sm">
                                    Loading models...
                                </div>
                            ) : filteredModels.length === 0 ? (
                                <div className="px-4 py-3 text-neutral-500 dark:text-neutral-400 text-sm">
                                    No models found.
                                </div>
                            ) : (
                                filteredModels.map((model) => (
                                    <DropdownMenuItem
                                        key={model.value}
                                        onSelect={handleModelSelect(model.value)}
                                        className={`flex flex-col items-start gap-1 px-4 py-3 cursor-pointer transition-colors
                                ${selectedModel === model.value
                                                ? "bg-neutral-100 dark:bg-neutral-800 font-semibold"
                                                : "hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                            }`}
                                    >
                                        <span className="text-neutral-900 dark:text-neutral-100">{model.title}</span>
                                        <span className="text-xs text-neutral-500 dark:text-neutral-400 text-justify">{model.description}</span>
                                        <div className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                                            Input: {model.price.input} | Output: {model.price.output} | Thinking: {model.price.thinking} / 1M tokens
                                        </div>
                                    </DropdownMenuItem>
                                ))
                            )}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </>
    );
}