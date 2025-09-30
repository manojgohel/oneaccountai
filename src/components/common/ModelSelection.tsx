"use client";

import getAiModels from "@/actions/ai/models";
import { updateConversation } from "@/actions/conversation/conversation.action";
import { getSelectedModels } from "@/actions/user/updateSelectedModels";
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
import { Zap, Star, Check, Sparkles, Brain } from "lucide-react";

export default function ModelSelection({ model, description }: { model?: string, description?: string }) {
    const [selectedModel, setSelectedModel] = React.useState(model || "");
    const [models, setModels] = React.useState<Array<any>>([]);

    const params = useParams();
    const { setState }: any = useGlobalContext();

    const { status, data: modelsData } = useQuery({
        queryKey: ['ai-models'],
        queryFn: getAiModels,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const { data: selectedModelsData } = useQuery({
        queryKey: ['selected-models'],
        queryFn: getSelectedModels,
        staleTime: 1000 * 60 * 2, // 2 minutes
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
        if (status === 'success' && modelsData && selectedModelsData?.selectedModels) {
            // Filter models to only include selected ones
            const selectedModelIds = selectedModelsData.selectedModels;
            const filteredModelsData = modelsData.filter((model: any) =>
                selectedModelIds.includes(model.modelId)
            );

            const formattedModels = filteredModelsData.map((model: any) => ({
                value: model.modelId,
                title: model.name,
                description: model.description || "No description available.",
                price: {
                    input: model.pricing ? `$${convertCurrency(model.pricing.input)}/1M` : "N/A",
                    output: model.pricing ? `$${convertCurrency(model.pricing.output)}/1M` : "N/A",
                },
            }));
            setModels(formattedModels);

            // If the currently selected model is not in the new list, reset to the first model
            if (!formattedModels.find((m: any) => m.value === selectedModel) && formattedModels.length > 0) {
                setSelectedModel(formattedModels[0].value);
                setState((prev: any) => ({ ...prev, model: formattedModels[0].value }));
            }
        }
    }, [status, modelsData, selectedModelsData, selectedModel, setState]);

    const selected = models.find((m) => m.value === selectedModel);

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
        if (modelValue.includes('gpt-4')) return <Sparkles className="w-5 h-5 text-purple-500" />;
        if (modelValue.includes('gpt-3.5')) return <Brain className="w-5 h-5 text-blue-500" />;
        if (modelValue.includes('claude')) return <Star className="w-5 h-5 text-orange-500" />;
        if (modelValue.includes('qwen')) return <Zap className="w-5 h-5 text-green-500" />;
        return <Brain className="w-5 h-5 text-gray-500" />;
    };

    const getModelDescription = (modelValue: string) => {
        if (modelValue.includes('gpt-4')) return "Our smartest model & more";
        if (modelValue.includes('gpt-3.5')) return "Great for everyday tasks";
        if (modelValue.includes('claude')) return "Advanced reasoning & analysis";
        if (modelValue.includes('qwen')) return "Multilingual & efficient";
        return "AI model for various tasks";
    };

    return (
        <div className="flex-1 min-w-0">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        className="text-left cursor-pointer border-0 p-0 w-full min-w-0 relative"
                        disabled={status === 'pending'}
                    >
                        <div className="flex flex-col items-start min-w-0">
                            <div className="flex items-center gap-2 w-full">
                                <div className="font-medium text-sm text-neutral-900 dark:text-neutral-100 truncate">
                                    {status === 'pending' ? 'Loading...' : selected?.title || 'Select Model'}
                                </div>
                            </div>
                            {(description || (selected && getModelDescription(selected.value))) && (
                                <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                                    {description || (selected && getModelDescription(selected.value))}
                                </div>
                            )}
                        </div>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="start"
                    side="bottom"
                    sideOffset={8}
                    alignOffset={0}
                    className="w-80 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-lg rounded-lg p-2"
                >
                    {status === 'pending' ? (
                        <div className="p-4 text-center">
                            <div className="text-sm text-neutral-500">Loading models...</div>
                        </div>
                    ) : models.length === 0 ? (
                        <div className="p-4 text-center">
                            <div className="text-sm text-neutral-500">No models available</div>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {models.map((model) => {
                                const isSelected = selectedModel === model.value;
                                return (
                                    <DropdownMenuItem
                                        key={model.value}
                                        onSelect={handleModelSelect(model.value)}
                                        className={`flex items-start gap-3 p-3 cursor-pointer rounded-md transition-colors ${
                                            isSelected
                                                ? 'bg-blue-50 dark:bg-blue-900/20'
                                                : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'
                                        }`}
                                    >
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getModelIcon(model.value)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-sm text-neutral-900 dark:text-neutral-100 truncate">
                                                        {model.title}
                                                    </div>
                                                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                                                        {getModelDescription(model.value)}
                                                    </div>
                                                </div>
                                                {isSelected && (
                                                    <Check className="w-4 h-4 text-blue-500 flex-shrink-0 ml-2" />
                                                )}
                                            </div>
                                        </div>
                                    </DropdownMenuItem>
                                );
                            })}
                        </div>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}