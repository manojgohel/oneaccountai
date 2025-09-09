import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Download, Sigma, Upload } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function TokenUsesComponent({ totalUsage }: { totalUsage: any }) {
    return (
        <>
            {totalUsage && (
                <div className="flex items-center gap-3 text-xs text-muted-foreground px-2 py-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="flex items-center gap-1 cursor-help">
                                <Download className="size-3" />
                                <span>{totalUsage.inputTokens}</span>
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Input tokens consumed</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="flex items-center gap-1 cursor-help">
                                <Upload className="size-3" />
                                <span>{totalUsage.outputTokens}</span>
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Output tokens generated</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="flex items-center gap-1 cursor-help">
                                <Sigma className="size-3" />
                                <span>{totalUsage.totalTokens}</span>
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Total tokens used (input + output)</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            )}
        </>
    )
}