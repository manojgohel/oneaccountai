import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BarChart3, Download, Sigma, Upload } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface TokenUsesComponentProps {
    totalUsage: any;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export default function TokenUsesComponent({
    totalUsage,
    open,
    onOpenChange
}: TokenUsesComponentProps) {
    if (!totalUsage) return null;

    const tokenData = [
        {
            icon: Download,
            value: totalUsage.inputTokens,
            label: "Input Tokens",
            tooltip: "Tokens consumed for processing your request",
            color: "text-blue-500",
            bgColor: "bg-blue-50 dark:bg-blue-950"
        },
        {
            icon: Upload,
            value: totalUsage.outputTokens,
            label: "Output Tokens",
            tooltip: "Tokens generated in the AI response",
            color: "text-green-500",
            bgColor: "bg-green-50 dark:bg-green-950"
        },
        {
            icon: Sigma,
            value: totalUsage.totalTokens,
            label: "Total Tokens",
            tooltip: "Combined input and output tokens",
            color: "text-orange-500",
            bgColor: "bg-orange-50 dark:bg-orange-950"
        }
    ];

    return (
        <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
                <button className="flex cursor-pointer items-center gap-2 px-2 py-1 rounded-md hover:bg-muted/50 transition-colors text-xs text-muted-foreground hover:text-foreground">
                    <BarChart3 className="size-3" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80" side="top" align="end">
                <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b">
                        <BarChart3 className="size-4 text-muted-foreground" />
                        <h3 className="font-semibold text-sm">Token Usage Details</h3>
                    </div>

                    <div className="space-y-3">
                        {tokenData.map(({ icon: Icon, value, label, tooltip, color, bgColor }, index) => (
                            <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${bgColor}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full bg-background ${color}`}>
                                        <Icon className="size-3" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm">{label}</div>
                                        <div className="text-xs text-muted-foreground">{tooltip}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-lg">{value?.toLocaleString()}</div>
                                    <div className="text-xs text-muted-foreground">tokens</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalUsage.cost && (
                        <div className="pt-2 border-t">
                            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                                <span className="font-medium text-sm">Estimated Cost</span>
                                <span className="font-bold">${totalUsage.cost?.toFixed(4)}</span>
                            </div>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}