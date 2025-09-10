/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Action, Actions } from '@/components/actions';
import { Loader } from '@/components/loader';
import { Message, MessageContent } from '@/components/message';
import {
    Reasoning,
    ReasoningContent,
    ReasoningTrigger,
} from '@/components/reasoning';
import { Response } from '@/components/response';
import {
    Source,
    Sources,
    SourcesContent,
    SourcesTrigger,
} from '@/components/sources';
import { cn } from '@/lib/utils';
import { useGlobalContext } from '@/providers/context-provider';
import { useChat } from '@ai-sdk/react';
import {
    CopyIcon,
    HeartIcon,
    RefreshCcwIcon,
    ShareIcon,
    ThumbsDownIcon,
    ThumbsUpIcon
} from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
import PromptInputComponent from './PromptInputComponent';
import TokenUsesComponent from './TokenUsesComponent';


interface ChatComponentProps {
    conversationId?: string | null;
    conversations?: any;
}

const ChatComponent = ({ conversationId, conversations }: ChatComponentProps) => {
    const [input, setInput] = useState('');
    const [webSearch, setWebSearch] = useState(false);
    const [tokenPopoverOpen, setTokenPopoverOpen] = useState<Record<string, boolean>>({});
    const { state } = useGlobalContext();

    // State for message interactions
    const [likedMessages, setLikedMessages] = useState<Set<string>>(new Set());
    const [dislikedMessages, setDislikedMessages] = useState<Set<string>>(new Set());
    const [favoriteMessages, setFavoriteMessages] = useState<Set<string>>(new Set());

    const { messages, sendMessage, status, regenerate } = useChat({ messages: conversations?.messages || [] });

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);
    const [autoScroll, setAutoScroll] = useState(true);

    // Track if user is at bottom before messages update
    useLayoutEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;
        const { scrollTop, scrollHeight, clientHeight } = container;
        // If user is within 100px of bottom, enable auto-scroll
        setAutoScroll(scrollHeight - scrollTop - clientHeight < 100);
    }, [messages.length]); // Only when messages count changes

    // Scroll to bottom if autoScroll is true
    useLayoutEffect(() => {
        if (autoScroll && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages.length, autoScroll]);

    // Update autoScroll on user scroll
    const handleScroll = () => {
        const container = messagesContainerRef.current;
        if (!container) return;
        const { scrollTop, scrollHeight, clientHeight } = container;
        setAutoScroll(scrollHeight - scrollTop - clientHeight < 100);
    };

    // Action handlers
    const handleCopy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch (error) {
            console.error('Failed to copy text:', error);
        }
    };

    const handleShare = async (text: string) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'AI Chat Response',
                    text: text,
                });
            } catch (error) {
                console.error('Failed to share:', error);
            }
        } else {
            // Fallback to copy
            handleCopy(text);
        }
    };

    const handleLike = (messageId: string) => {
        setLikedMessages(prev => {
            const newSet = new Set(prev);
            if (newSet.has(messageId)) {
                newSet.delete(messageId);
            } else {
                newSet.add(messageId);
                // Remove from disliked if it was disliked
                setDislikedMessages(prevDisliked => {
                    const newDislikedSet = new Set(prevDisliked);
                    newDislikedSet.delete(messageId);
                    return newDislikedSet;
                });
            }
            return newSet;
        });
    };

    const handleDislike = (messageId: string) => {
        setDislikedMessages(prev => {
            const newSet = new Set(prev);
            if (newSet.has(messageId)) {
                newSet.delete(messageId);
            } else {
                newSet.add(messageId);
                // Remove from liked if it was liked
                setLikedMessages(prevLiked => {
                    const newLikedSet = new Set(prevLiked);
                    newLikedSet.delete(messageId);
                    return newLikedSet;
                });
            }
            return newSet;
        });
    };

    const handleFavorite = (messageId: string) => {
        setFavoriteMessages(prev => {
            const newSet = new Set(prev);
            if (newSet.has(messageId)) {
                newSet.delete(messageId);
            } else {
                newSet.add(messageId);
            }
            return newSet;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            sendMessage(
                { text: input },
                {
                    body: {
                        model: state?.model || "openai/gpt-4.1-mini",
                        webSearch: webSearch,
                        conversationId
                    },
                },
            );
            setInput('');
        }
    };

    return (
        <div className="flex min-h-full flex-col">
            {messages.length === 0 && status !== 'streaming' && (
                <div className="flex flex-1 flex-col items-center justify-center  text-center">
                    <h1 className="text-2xl font-semibold">Welcome to One Account AI</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Ask any question related to One Account and get instant answers from 50+ premium AI models.
                    </p>
                </div>
            )}
            {/* Messages Container */}
            <div
                className="flex-1 min-h-0 p-1" // <-- add min-h-0 here!
                ref={messagesContainerRef}
                onScroll={handleScroll}
                style={{ overflowY: 'auto' }}
            >
                <div className="max-w-6xl mx-auto px-1">
                    {/* messages */}
                    {messages && messages.map((message, messageIndex) => (
                        <div key={message.id} className="mb-4">
                            {message.role === 'assistant' && message.parts.filter(
                                (part) => part.type === 'source-url',
                            ).length > 0 && (
                                    <Sources>
                                        <SourcesTrigger
                                            count={
                                                message.parts.filter(
                                                    (part) => part.type === 'source-url',
                                                ).length
                                            }
                                        />
                                        {message.parts.filter((part) => part.type === 'source-url').map((part: any, i) => (
                                            <SourcesContent key={`${message.id}-${i}`}>
                                                <Source
                                                    key={`${message.id}-${i}`}
                                                    href={part.url}
                                                    title={part.url}
                                                />
                                            </SourcesContent>
                                        ))}
                                    </Sources>
                                )}
                            <Message from={message.role} key={message.id}>
                                <MessageContent key={`${message.id}-content`}>
                                    {message.parts.map((part: any, i: number) => {
                                        const isLastMessage = messageIndex === messages.length - 1;
                                        switch (part.type) {
                                            case 'text':
                                                return (
                                                    <div key={`${message.id}-${i}`}>
                                                        <Response>
                                                            {part.text}
                                                        </Response>
                                                        {message.role === 'assistant' && (
                                                            <>
                                                                <Actions className={cn(
                                                                    "mt-2 transition-opacity duration-200 group-hover:opacity-100",
                                                                    isLastMessage ? "opacity-100" : "opacity-0 "
                                                                )}>
                                                                    <Action
                                                                        className='cursor-pointer'
                                                                        onClick={() => regenerate()}
                                                                        tooltip="Retry"
                                                                        label="Retry"
                                                                        disabled={!isLastMessage || status === 'streaming'}
                                                                    >
                                                                        <RefreshCcwIcon className="size-3" />
                                                                    </Action>
                                                                    <Action
                                                                        className='cursor-pointer'
                                                                        onClick={() => handleCopy(part.text)}
                                                                        tooltip="Copy"
                                                                        label="Copy"
                                                                    >
                                                                        <CopyIcon className="size-3" />
                                                                    </Action>
                                                                    <Action
                                                                        className='cursor-pointer'
                                                                        onClick={() => handleLike(message.id)}
                                                                        tooltip="Like"
                                                                        label="Like"
                                                                        variant={likedMessages.has(message.id) ? 'default' : 'ghost'}
                                                                    >
                                                                        <ThumbsUpIcon className="size-3" />
                                                                    </Action>
                                                                    <Action
                                                                        className='cursor-pointer'
                                                                        onClick={() => handleDislike(message.id)}
                                                                        tooltip="Dislike"
                                                                        label="Dislike"
                                                                        variant={dislikedMessages.has(message.id) ? 'default' : 'ghost'}
                                                                    >
                                                                        <ThumbsDownIcon className="size-3" />
                                                                    </Action>
                                                                    <Action
                                                                        className='cursor-pointer'
                                                                        onClick={() => handleShare(part.text)}
                                                                        tooltip="Share"
                                                                        label="Share"
                                                                    >
                                                                        <ShareIcon className="size-3" />
                                                                    </Action>
                                                                    <Action
                                                                        className='cursor-pointer'
                                                                        onClick={() => handleFavorite(message.id)}
                                                                        tooltip="Favorite"
                                                                        label="Favorite"
                                                                        variant={favoriteMessages.has(message.id) ? 'default' : 'ghost'}
                                                                    >
                                                                        <HeartIcon className="size-3" />
                                                                    </Action>
                                                                    {/* Token Usage Display */}
                                                                    <TokenUsesComponent
                                                                        totalUsage={(message as any).totalUsage}
                                                                        open={tokenPopoverOpen[message.id] || false}
                                                                        onOpenChange={(open) => setTokenPopoverOpen(prev => ({
                                                                            ...prev,
                                                                            [message.id]: open
                                                                        }))}
                                                                    />
                                                                </Actions>
                                                            </>
                                                        )
                                                        }
                                                    </div>
                                                );
                                            case 'reasoning':
                                                return (
                                                    <>
                                                        {status === 'streaming' && part.text &&
                                                            <Reasoning
                                                                key={`${message.id}-reasoning`}
                                                                className="w-full"
                                                                isStreaming={status === 'streaming'}
                                                            >
                                                                <ReasoningTrigger />
                                                                <ReasoningContent>{part.text}</ReasoningContent>
                                                            </Reasoning>
                                                        }
                                                    </>
                                                );
                                            default:
                                                return null;
                                        }
                                    })}
                                </MessageContent>
                            </Message>
                        </div>
                    ))}
                    {status === 'submitted' && <Loader />}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Footer - Now part of the same container */}
            <div className="sticky bottom-0 z-20 bg-background">
                <div className="max-w-6xl mx-auto px-1 py-4">
                    <PromptInputComponent
                        handleSubmit={handleSubmit}
                        setInput={setInput}
                        input={input}
                        status={status}
                        webSearch={webSearch}
                        setWebSearch={setWebSearch}
                    />
                </div>
            </div>
        </div >
    );
};

export default ChatComponent;