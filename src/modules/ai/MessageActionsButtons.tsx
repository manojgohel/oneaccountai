import { Action, Actions } from "@/components/actions";
import { cn } from "@/lib/utils";
import { CopyIcon, RefreshCcwIcon, Share2Icon } from "lucide-react";
import TokenUsesComponent from "./TokenUsesComponent";

interface MessageActionsButtonsProps {
    readonly regenerate: (params: { messageId: string }) => void;
    readonly isLastMessage: boolean;
    readonly message: any;
    readonly tokenPopoverOpen: Record<string, boolean>;
    readonly setTokenPopoverOpen: (callback: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
    readonly status: 'streaming' | 'awaiting_message' | 'awaiting_response' | 'idle' | 'submitted' | 'ready' | 'error';
}

export default function MessageActionsButtons({ regenerate, isLastMessage, message, tokenPopoverOpen, setTokenPopoverOpen, status }: MessageActionsButtonsProps) {

    const handleCopy = (message: any) => {
        if (message?.[0]?.text) {
            navigator.clipboard.writeText(message[0].text).then(() => {
                // You can add a toast notification here if you have a toast system
                console.log('Message copied to clipboard');
            }).catch(err => {
                console.error('Failed to copy message: ', err);
                // You can show an error toast here
            });
        }
    };

    const handleShare = async (message: any) => {
        if (message?.[0]?.text) {
            try {
                // Check if Web Share API is supported
                if (navigator.share) {
                    await navigator.share({
                        title: 'AI Chat Message',
                        text: message[0].text,
                    });
                } else {
                    // Fallback to clipboard
                    await navigator.clipboard.writeText(message[0].text);
                    console.log('Message copied to clipboard (share fallback)');
                }
            } catch (err) {
                console.error('Failed to share message: ', err);
                // Fallback to clipboard if share fails
                try {
                    await navigator.clipboard.writeText(message[0].text);
                    console.log('Message copied to clipboard (share fallback)');
                } catch (clipboardErr) {
                    console.error('Failed to copy to clipboard: ', clipboardErr);
                }
            }
        }
    };
    return (
        <Actions className={cn(
            "mt-2 transition-opacity duration-200 group-hover:opacity-100",
            isLastMessage ? "opacity-100" : "opacity-0 "
        )}>
            <Action
                className='cursor-pointer'
                onClick={() => {
                    if (message?.id) {
                        regenerate({ messageId: message.id });
                    }
                }}
                tooltip="Retry"
                label="Retry"
                disabled={!isLastMessage || status === 'streaming' || !message?.id}
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
                totalUsage={message.totalUsage}
                open={tokenPopoverOpen[message.id] || false}
                onOpenChange={(open) => setTokenPopoverOpen((prev: any) => ({
                    ...prev,
                    [message.id]: open
                }))}
            />
        </Actions>
    )
}