
"use client";

import getAiModels from "@/actions/ai/models";
import { updateConversation } from "@/actions/conversation/conversation.action";
import { useGlobalContext } from "@/providers/context-provider";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import * as React from "react";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Search, Zap, Clock, Star, DollarSign, Check } from "lucide-react";

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
    const searchInputRef = React.useRef<HTMLInputElement>(null);

    const params = useParams();

    const { setState, state }: any = useGlobalContext();
    const { status, data: modelsData } = useQuery({
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

    const freeAccountModels = ["openai/gpt-3.5-turbo", "openai/gpt-4o-mini", "alibaba/qwen-3-14b"];


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
    }, [status, modelsData, selectedModel, setState]);

    const selected = models.find((m) => m.value === selectedModel);

    const filteredModels = [
        ...models.filter((model) => freeAccountModels.includes(model.value)),
        ...models.filter((model) =>
            !freeAccountModels.includes(model.value)
        ),
    ].filter(
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

    const getModelIcon = (modelValue: string) => {
        if (modelValue.includes('gpt-4')) return <Zap className="w-4 h-4 text-blue-500" />;
        if (modelValue.includes('gpt-3.5')) return <Clock className="w-4 h-4 text-green-500" />;
        if (modelValue.includes('claude')) return <Star className="w-4 h-4 text-purple-500" />;
        return <Zap className="w-4 h-4 text-gray-500" />;
    };

    const getModelCategory = (modelValue: string) => {
        if (modelValue.includes('openai')) return 'OpenAI';
        if (modelValue.includes('anthropic')) return 'Anthropic';
        if (modelValue.includes('google')) return 'Google';
        if (modelValue.includes('meta')) return 'Meta';
        return 'Other';
    };
    return (
        <>
            {/* {JSON.stringify(params?.conversationId)} */}
            <div className="flex-1 min-w-0 overflow-hidden">
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="text-left cursor-pointer bg-transparent border-0 p-0 w-full min-w-0"
                            disabled={status === 'pending'}
                        >
                            <div className="flex flex-col items-start min-w-0 overflow-hidden">
                                <div className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 truncate w-full">
                                    {status === 'pending' ? (
                                        <span>Loading models...</span>
                                    ) : (
                                        selected?.title
                                    )}
                                </div>
                                <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate w-full">
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
                        className="w-[calc(100vw-2rem)] sm:w-96 md:w-[32rem] lg:w-[40rem] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-xl rounded-lg p-0 flex flex-col max-h-[80vh]"
                    >
                        {/* Enhanced Header with Search */}
                        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 sticky top-0 z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <Zap className="w-4 h-4 text-blue-500" />
                                <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                                    Select AI Model
                                </h3>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                <Input
                                    ref={searchInputRef}
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search models by name or description..."
                                    className="pl-10 pr-4 py-2 bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    autoFocus
                                    disabled={status === 'pending'}
                                />
                            </div>
                        </div>
                        {/* Enhanced Models List */}
                        <div className="max-h-80 overflow-y-auto">
                            {status === 'pending' ? (
                                <div className="p-6 space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex items-center gap-3 p-3">
                                            <Skeleton className="w-4 h-4 rounded" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="w-3/4 h-4" />
                                                <Skeleton className="w-1/2 h-3" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredModels.length === 0 ? (
                                <div className="p-6 text-center">
                                    <Search className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                                    <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                                        No models found matching &quot;{search}&quot;
                                    </p>
                                </div>
                            ) : (
                                <div className="p-2">
                                    {filteredModels.map((model, index) => {
                                        const isFree = state?.user?.balance > 0 || freeAccountModels.includes(model.value);
                                        const isSelected = selectedModel === model.value;
                                        const category = getModelCategory(model.value);

                                        return (
                                            <div key={model.value}>
                                                {index > 0 && getModelCategory(filteredModels[index - 1].value) !== category && (
                                                    <Separator className="my-2" />
                                                )}
                                                <DropdownMenuItem
                                                    disabled={!isFree}
                                                    onSelect={handleModelSelect(model.value)}
                                                    className={`group flex items-start gap-3 p-4 cursor-pointer transition-all duration-200 rounded-lg mx-1
                                                        ${isSelected
                                                            ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                                                            : "hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                                        } ${!isFree ? "opacity-50" : ""}`}
                                                >
                                                    <div className="flex-shrink-0 mt-0.5">
                                                        {getModelIcon(model.value)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 truncate">
                                                                {model.title}
                                                            </span>
                                                            {isSelected && (
                                                                <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                                            )}
                                                            <Badge
                                                                variant={isFree ? "default" : "secondary"}
                                                                className="text-xs"
                                                            >
                                                                {isFree ? "Free" : "Paid"}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-2">
                                                            {model.description}
                                                        </p>
                                                        <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-500">
                                                            <div className="flex items-center gap-1">
                                                                <DollarSign className="w-3 h-3" />
                                                                <span>Input: {model.price.input}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <DollarSign className="w-3 h-3" />
                                                                <span>Output: {model.price.output}</span>
                                                            </div>
                                                            {model.price.thinking !== "N/A" && (
                                                                <div className="flex items-center gap-1">
                                                                    <DollarSign className="w-3 h-3" />
                                                                    <span>Thinking: {model.price.thinking}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </DropdownMenuItem>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </>
    );
}