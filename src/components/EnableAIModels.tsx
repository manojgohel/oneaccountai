"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "./ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { updateSelectedModels, getSelectedModels } from "@/actions/user/updateSelectedModels";
import { toast } from "sonner";
import {
    Settings,
    CheckCircle,
    AlertCircle,
    Save,
    RefreshCw,
    Search,
    X
} from "lucide-react";
import getAiModels from "@/actions/ai/models";
import { useQuery } from "@tanstack/react-query";
import { useGlobalContext } from "@/providers/context-provider";
import { useRouter } from "next/navigation";
import WalletTopupDialog from "./WalletTopupDialog";


export default function EnableAIModels() {
    const [selectedModels, setSelectedModels] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [showWalletDialog, setShowWalletDialog] = useState(false);
    const [pendingModel, setPendingModel] = useState<{ modelId: string; name: string; requiredBalance: number } | null>(null);

    const { state } = useGlobalContext();
    const router = useRouter();


    const { data: availableModels, isLoading: modelsLoading, error: modelsError } = useQuery({
        queryKey: ['ai-models'],
        queryFn: getAiModels,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });


    // Fetch user's current selected models
    useEffect(() => {
        async function fetchUserModels() {
            try {
                setLoading(true);
                const response = await getSelectedModels();
                if (response.status && response.selectedModels) {
                    setSelectedModels(response.selectedModels);
                } else {
                    setError(response.message || "Failed to load model preferences");
                }
            } catch (err) {
                setError("Failed to load model preferences");
                console.error("Error fetching user models:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchUserModels();
    }, []);

    // Handle model toggle
    const handleModelToggle = (modelId: string) => {
        if (!modelId) return;

        // Find the model data
        const model = availableModels?.find((m: any) => m.modelId === modelId);
        if (!model) return;

        // Check if model is free
        if (isModelFree(model.pricing)) {
            // Free model - allow toggle without balance check
            setSelectedModels(prev => {
                if (prev.includes(modelId)) {
                    return prev.filter(id => id !== modelId);
                } else {
                    return [...prev, modelId];
                }
            });
            return;
        }

        // Premium model - check balance
        const requiredBalance = calculateRequiredBalance(model.pricing);
        const currentBalance = (state?.user as any)?.balance || 0;

        if (currentBalance < requiredBalance) {
            // Insufficient balance - show wallet dialog
            setPendingModel({
                modelId,
                name: model.name || 'Unknown Model',
                requiredBalance
            });
            setShowWalletDialog(true);
            return;
        }

        // Sufficient balance - allow toggle
        setSelectedModels(prev => {
            if (prev.includes(modelId)) {
                return prev.filter(id => id !== modelId);
            } else {
                return [...prev, modelId];
            }
        });
    };

    // Save selected models
    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);

            const response = await updateSelectedModels(selectedModels);

            if (response.status) {
                toast.success("AI models updated successfully");
            } else {
                setError(response.message || "Failed to update models");
                toast.error("Failed to update models");
            }
        } catch (err) {
            setError("Failed to update models");
            toast.error("Failed to update models");
            console.error("Error updating models:", err);
        } finally {
            setSaving(false);
        }
    };

    // Helper function to get provider from modelId
    const getProvider = (modelId: string) => {
        return modelId?.split('/')[0] || 'Unknown';
    };

    // Helper function to determine category based on pricing
    const getCategory = (pricing: any) => {
        if (!pricing?.input || !pricing?.output) return 'free';
        const inputPrice = pricing.input;
        const outputPrice = pricing.output;

        // Premium if input price > 1e-6 or output price > 1e-5
        if (inputPrice > 1e-6 || outputPrice > 1e-5) return 'premium';
        // Standard if input price > 1e-7 or output price > 1e-6
        if (inputPrice > 1e-7 || outputPrice > 1e-6) return 'standard';
        return 'free';
    };

    // Helper function to format pricing
    const formatPricing = (price: number) => {
        if (price === 0) return 'Free';
        if (price >= 1e-3) return `$${(price * 1000).toFixed(1)}/1K tokens`;
        if (price >= 1e-6) return `$${(price * 1000000).toFixed(2)}/1M tokens`;
        if (price >= 1e-9) return `$${(price * 1000000).toFixed(3)}/1M tokens`;
        return `$${(price * 1000000).toFixed(4)}/1M tokens`;
    };

    // Helper function to calculate required balance for 1M tokens
    const calculateRequiredBalance = (pricing: any) => {
        if (!pricing?.input && !pricing?.output) return 0;
        const inputPrice = pricing.input || 0;
        const outputPrice = pricing.output || 0;
        // Use the higher of input or output price for 1M tokens
        return Math.max(inputPrice * 1000000, outputPrice * 1000000);
    };

    // Helper function to check if model is free
    const isModelFree = (pricing: any) => {
        return !pricing?.input && !pricing?.output;
    };

    // Filter models based on search query
    const filteredModels = availableModels?.filter((model: any) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        const provider = getProvider(model.modelId);
        const category = getCategory(model.pricing);

        return (
            (model.name?.toLowerCase().includes(query)) ||
            (provider?.toLowerCase().includes(query)) ||
            (model.description?.toLowerCase().includes(query)) ||
            (category?.toLowerCase().includes(query))
        );
    }) || [];

    // Get category badge variant
    const getCategoryBadge = (category: string) => {
        switch (category) {
            case 'premium':
                return <Badge variant="destructive" className="text-xs">Premium</Badge>;
            case 'standard':
                return <Badge variant="secondary" className="text-xs">Standard</Badge>;
            case 'free':
                return <Badge variant="outline" className="text-xs text-green-600 border-green-600">Free</Badge>;
            default:
                return null;
        }
    };

    // Clear search
    const clearSearch = () => {
        setSearchQuery("");
    };

    // Handle wallet top-up
    const handleWalletTopup = () => {
        setShowWalletDialog(false);
        router.push('/secure/wallet');
    };

    // Close wallet dialog
    const handleCloseWalletDialog = () => {
        setShowWalletDialog(false);
        setPendingModel(null);
    };

    if (loading || modelsLoading) {
        return (
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Settings className="h-5 w-5 text-blue-600" />
                        AI Model Preferences
                    </CardTitle>
                    <CardDescription>
                        Configure which AI models are available for your conversations
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[400px] w-full">
                        <div className="space-y-4 pr-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="w-4 h-4 rounded" />
                                        <div className="space-y-2">
                                            <Skeleton className="w-32 h-4" />
                                            <Skeleton className="w-48 h-3" />
                                        </div>
                                    </div>
                                    <Skeleton className="w-12 h-6 rounded-full" />
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Settings className="h-5 w-5 text-blue-600" />
                            AI Model Preferences
                        </CardTitle>
                        <CardDescription>
                            Configure which AI models are available for your conversations
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                            {selectedModels.length} enabled
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {(error || modelsError) && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <p className="text-sm text-red-600 dark:text-red-400">
                                {error || 'Failed to load AI models. Please try again.'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Search Input */}
                <div className="mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            type="text"
                            placeholder="Search models by name, provider, or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-10"
                        />
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 hover:text-slate-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    {searchQuery && (
                        <p className="text-xs text-slate-500 mt-2">
                            {filteredModels.length} model{filteredModels.length !== 1 ? 's' : ''} found
                        </p>
                    )}
                </div>
                <ScrollArea className="h-[400px] w-full">
                    <div className="space-y-4 pr-4">
                        {!availableModels || availableModels.length === 0 ? (
                            <div className="text-center py-8">
                                <Settings className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                                <p className="text-sm text-slate-500">No AI models available</p>
                                <p className="text-xs text-slate-400 mt-1">Please check your connection and try again</p>
                            </div>
                        ) : filteredModels.length === 0 && searchQuery ? (
                            <div className="text-center py-8">
                                <Search className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                                <p className="text-sm text-slate-500">No models found matching &quot;{searchQuery}&quot;</p>
                                <button
                                    onClick={clearSearch}
                                    className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                                >
                                    Clear search
                                </button>
                            </div>
                        ) : (
                            filteredModels.map((model: any, index: number) => {
                            if (!model?.modelId) return null;
                            const isEnabled = selectedModels.includes(model.modelId);
                            const provider = getProvider(model.modelId);
                            const category = getCategory(model.pricing);

                            return (
                                <div key={model.modelId}>
                                    {index > 0 && <Separator className="my-4" />}
                                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="flex-shrink-0">
                                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                                    <Settings className="w-4 h-4 text-blue-600" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                                                        {model.name || 'Unknown Model'}
                                                    </h3>
                                                    {getCategoryBadge(category)}
                                                    {isEnabled && (
                                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                                                    {model.description || 'No description available'}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
                                                    <span className="font-medium">{provider}</span>
                                                    <span>•</span>
                                                    <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs">
                                                        Input: {formatPricing(model.pricing?.input || 0)}
                                                    </span>
                                                    <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs">
                                                        Output: {formatPricing(model.pricing?.output || 0)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0 ml-4">
                                            <Switch
                                                checked={isEnabled}
                                                onCheckedChange={() => handleModelToggle(model.modelId)}
                                                className="data-[state=checked]:bg-blue-600"
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                        )}
                    </div>
                </ScrollArea>

                <div className="mt-6 pt-4 border-t">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            {selectedModels.length === 0 ? (
                                <span className="text-amber-600 dark:text-amber-400">
                                    No models selected. Please enable at least one model.
                                </span>
                            ) : (
                                <span>
                                    {selectedModels.length} model{selectedModels.length !== 1 ? 's' : ''} enabled
                                </span>
                            )}
                        </div>
                        <Button
                            onClick={handleSave}
                            disabled={saving || selectedModels.length === 0}
                            className="flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Wallet Top-up Dialog */}
        {pendingModel && (
            <WalletTopupDialog
                isOpen={showWalletDialog}
                onClose={handleCloseWalletDialog}
                modelName={pendingModel.name}
                requiredBalance={pendingModel.requiredBalance}
                currentBalance={(state?.user as any)?.balance || 0}
                onTopup={handleWalletTopup}
            />
        )}
        </>
    );
}

