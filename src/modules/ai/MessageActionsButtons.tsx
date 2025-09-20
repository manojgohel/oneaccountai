import { Action, Actions } from "@/components/actions";
import { cn } from "@/lib/utils";
import { CopyIcon, RefreshCcwIcon, Share2Icon } from "lucide-react";
import TokenUsesComponent from "./TokenUsesComponent";

export default function MessageActionsButtons({ regenerate, isLastMessage, message, tokenPopoverOpen, setTokenPopoverOpen }: any) {

    const handleCopy = (message: any) => {
        if (message) {
            navigator.clipboard.writeText(message[0]?.text).then(() => {
            }).catch(err => {
                console.error('Failed to copy message: ', err);
            });
        }
    };

    const handleShare = (message: any) => {
        // Implement share functionality here
        if (message) {
            navigator.clipboard.writeText(message[0]?.text).then(() => {
                // Optionally, you can provide feedback to the user that the share was successful
                console.log('Message shared to clipboard');
            }).catch(err => {
                console.error('Failed to copy message: ', err);
            });
        }
    };
    return (<>
        <Actions className={cn(
            "mt-2 transition-opacity duration-200 group-hover:opacity-100",
            isLastMessage ? "opacity-100" : "opacity-0 "
        )}>
            <Action
                className='cursor-pointer'
                onClick={() => {
                    regenerate({ messageId: message?.id })
                }}
                tooltip="Retry"
                label="Retry"
                disabled={!isLastMessage || status === 'streaming'}
            >
                <RefreshCcwIcon className="size-3" />
            </Action>
            <Action
                className='cursor-pointer'
                onClick={() => handleCopy(message?.parts)}
                tooltip="Copy"
                label="Copy"
                disabled={!message?.parts}
            >
                <CopyIcon className="size-3" />
            </Action>
            <Action
                className='cursor-pointer'
                onClick={() => handleShare(message?.parts)}
                tooltip="Share"
                label="Share"
                disabled={!message?.parts}
            >
                <Share2Icon className="size-3" />
            </Action>
            {/* Token Usage Display */}
            <TokenUsesComponent
                totalUsage={(message as any).totalUsage}
                open={tokenPopoverOpen[message.id] || false}
                onOpenChange={(open) => setTokenPopoverOpen((prev: any) => ({
                    ...prev,
                    [message.id]: open
                }))}
            />
        </Actions>
    </>)
}