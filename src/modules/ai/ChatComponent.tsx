/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { getMessages } from '@/actions/conversation/message.action';
import { uploadToS3 } from '@/actions/upload.action';
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
import { Button } from '@/components/ui/button';
import { FILE_URL } from '@/consts/ai.consts';
import { useGreeting } from '@/hooks/use-get-greeting';
import { cn } from '@/lib/utils';
import { useGlobalContext } from '@/providers/context-provider';
import { useChat } from '@ai-sdk/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    ChevronUpIcon,
    RefreshCcwIcon
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
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
    const [paginationCursor, setPaginationCursor] = useState<string | null>(null);
    const [allMessages, setAllMessages] = useState<any[]>([]);
    const [hasMoreMessages, setHasMoreMessages] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);

    const { state, setState } = useGlobalContext();

    // File upload state
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [isUploadingFile, setIsUploadingFile] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const queryClient = useQueryClient();

    // Initialize useChat hook with empty messages initially
    const { messages, sendMessage, status, regenerate, setMessages } = useChat({
        messages: [],
        onFinish: () => {
            setShouldScrollToBottom(true);
            scrollToBottom();
            if (messages && messages.length < 2) {
                queryClient.invalidateQueries({ queryKey: ["conversationMetaData"] });
                queryClient.invalidateQueries({ queryKey: ['conversations'] });
            }
        }
    });

    // Initialize conversation data
    useEffect(() => {
        if (conversations && !isInitialized) {
            const { messages: conversationMessages, ...rest } = conversations;
            setState((prev) => ({ ...prev, model: conversations.model, conversation: rest }));

            if (conversationMessages && conversationMessages.length > 0) {
                setAllMessages(conversationMessages);
                setMessages(conversationMessages);
                setPaginationCursor(conversationMessages[0]._id || conversationMessages[0].id);

                setTimeout(() => {
                    scrollToBottom();
                }, 100);
            }
            setIsInitialized(true);
        }
    }, [conversations, setState, setMessages, isInitialized]);

    // Query for loading more messages
    const { data: paginatedData, refetch: refetchMessages, isFetching } = useQuery({
        queryKey: ['paginated-messages', conversationId, paginationCursor],
        enabled: false,
        queryFn: () => getMessages({
            conversationId: conversationId || '',
            limit: 10,
            lastId: paginationCursor || ""
        }),
    });

    // Handle loading more messages
    const handleLoadMore = useCallback(async () => {
        if (isLoadingMore || !hasMoreMessages || !paginationCursor) return;

        setIsLoadingMore(true);
        setShouldScrollToBottom(false);

        try {
            const result = await refetchMessages();

            if (result.data?.status && result.data.messages.length > 0) {
                const newMessages = result.data.messages;

                setAllMessages(prev => {
                    const existingIds = new Set(prev.map(msg => msg._id || msg.id));
                    const uniqueNewMessages = newMessages.filter((msg: any) =>
                        !existingIds.has(msg._id || msg.id)
                    );
                    const updatedMessages: any = [...uniqueNewMessages, ...prev];

                    // Update useChat immediately
                    setMessages(updatedMessages);

                    return updatedMessages;
                });

                setHasMoreMessages(result.data.pagination?.hasMore || false);
                if (result.data.pagination?.hasMore) {
                    setPaginationCursor(newMessages[0]._id || newMessages[0].id);
                } else {
                    setPaginationCursor(null);
                }

                setTimeout(() => {
                    scrollToTop();
                }, 100);
            } else {
                setHasMoreMessages(false);
                setPaginationCursor(null);
            }
        } catch (error) {
            console.error('Error loading more messages:', error);
        } finally {
            setIsLoadingMore(false);
        }
    }, [isLoadingMore, hasMoreMessages, paginationCursor, refetchMessages, setMessages]);

    // Initialize pagination state
    useEffect(() => {
        if (conversations?.messages) {
            const messageCount = conversations.messages.length;
            if (messageCount >= 5) {
                setHasMoreMessages(true);
            }
        }
    }, [conversations?.messages]);

    // Sync messages from useChat back to allMessages (for new messages only)
    useEffect(() => {
        if (messages.length > allMessages.length && !isLoadingMore) {
            setAllMessages(messages);
        }
    }, [messages, allMessages.length, isLoadingMore]);

    // Handle scrolling
    useEffect(() => {
        if (shouldScrollToBottom && !isLoadingMore) {
            scrollToBottom();
        }
    }, [allMessages, shouldScrollToBottom, isLoadingMore]);

    useEffect(() => {
        if (shouldScrollToBottom && !isLoadingMore) {
            if (status === 'streaming' || status === 'submitted') {
                scrollToBottom();
            }
        }
    }, [messages, status, isLoadingMore, shouldScrollToBottom]);

    // File upload handlers
    const handleImageSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile: any = e.target.files?.[0];
        if (!selectedFile) return;

        try {
            setIsUploadingFile(true);
            const formData = new FormData();
            formData.append('file', selectedFile);

            const result: any = await uploadToS3(formData);

            if (result?.success && result.url) {
                setSelectedImages(prev => [...prev, result.url]);
            } else {
                console.error('Failed to upload file');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        } finally {
            setIsUploadingFile(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed) return;

        setShouldScrollToBottom(true);

        const parts: any[] = [
            ...(
                selectedImages.length > 0
                    ? selectedImages.map((file) => ({
                        type: 'file',
                        mediaType: 'image/png',
                        url: `${FILE_URL}${file}`,
                        filename: file
                    }))
                    : []
            ),
            ...(trimmed ? [{ type: 'text', text: trimmed }] : [])
        ];

        sendMessage(
            {
                role: 'user',
                parts
            } as any,
            {
                body: {
                    model: state?.model || 'openai/gpt-4.1-mini',
                    webSearch,
                    conversationId
                }
            }
        );

        setInput('');
        setSelectedImages([]);
    };

    const containerRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (bottomRef.current) {
            setTimeout(() => {
                bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }, 50);
        }
    };

    const scrollToTop = () => {
        if (containerRef.current) {
            containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const greeting = useGreeting();

    return (
        <div className="flex min-h-full flex-col bg-secondary">
            {allMessages.length === 0 && status !== 'streaming' && (
                <div className="flex flex-1 items-center justify-center w-full min-h-[60vh]">
                    <div className="w-full max-w-4xl px-4">
                        <h1 className='text-center p-5 text-3xl'>{greeting}, {state?.user?.name || state?.user?.email || "Guest"}</h1>
                        <PromptInputComponent
                            handleSubmit={handleSubmit}
                            setInput={setInput}
                            input={input}
                            status={status}
                            webSearch={webSearch}
                            setWebSearch={setWebSearch}
                            onImageSelect={handleImageSelect}
                            fileInputRef={fileInputRef}
                            isUploadingFile={isUploadingFile}
                            selectedImages={selectedImages}
                            removeImage={removeImage}
                            handleFileChange={handleFileChange}
                        />
                    </div>
                </div>
            )}

            {/* Messages Container */}
            <div
                ref={containerRef}
                style={{ scrollBehavior: "smooth" }}
                className="flex-1 overflow-y-auto overscroll-contain px-1 sm:px-2 py-1 scroll-smooth bg-secondary"
            >
                <div className="max-w-6xl mx-auto px-1 min-h-[75vh]" style={{ scrollBehavior: 'smooth' }}>
                    {/* Load More Button */}
                    {hasMoreMessages && allMessages.length > 0 && (
                        <div className="flex justify-center py-4">
                            <Button
                                onClick={handleLoadMore}
                                disabled={isLoadingMore}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                {isLoadingMore ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <ChevronUpIcon className="size-4" />
                                        Load More Messages
                                    </>
                                )}
                            </Button>
                        </div>
                    )}

                    {/* Messages */}
                    {allMessages && allMessages.map((message, messageIndex) => (
                        <div key={message.id || message._id} className="mb-4">
                            {message.role === 'assistant' && message.parts?.filter(
                                (part: any) => part.type === 'source-url',
                            ).length > 0 && (
                                    <Sources>
                                        <SourcesTrigger
                                            count={
                                                message.parts.filter(
                                                    (part: any) => part.type === 'source-url',
                                                ).length
                                            }
                                        />
                                        {message.parts.filter((part: any) => part.type === 'source-url').map((part: any, i: number) => (
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
                            <Message from={message.role} key={message.id || message._id}>
                                <MessageContent key={`${message.id}-content`}>
                                    {/* Images grid (if any) */}
                                    {message.parts?.some((part: any) => part.type === 'image') && (
                                        <div className="mb-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {message.parts
                                                    ?.filter((part: any) => part.type === 'image')
                                                    .map((part: any, i: number) => (
                                                        <div
                                                            key={`${message.id}-image-${i}`}
                                                            className="relative group overflow-hidden rounded-lg border bg-gray-50 dark:bg-gray-800 cursor-pointer"
                                                            onClick={() => window.open(part.image, '_blank')}
                                                        >
                                                            <img
                                                                src={part.image}
                                                                alt={`Message image ${i + 1}`}
                                                                className="w-full h-48 sm:h-56 lg:h-64 object-cover transition-transform group-hover:scale-105"
                                                                onLoad={() => {
                                                                    if (shouldScrollToBottom) {
                                                                        setTimeout(() => scrollToBottom(), 50);
                                                                    }
                                                                }}
                                                            />
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                                                                <div className="bg-white/90 dark:bg-black/90 rounded-full p-2">
                                                                    <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    )}

                                    {/* Text and other parts (exclude images) */}
                                    {message.parts
                                        ?.filter((part: any) => part.type !== 'image')
                                        .map((part: any, i: number) => {
                                            const isLastMessage = messageIndex === allMessages.length - 1;
                                            switch (part.type) {
                                                case 'text':
                                                    return (
                                                        <div key={`${message.id}-${i}`} >
                                                            <Response>{part.text}</Response>
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
                                                            )}
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
                                                case 'file':
                                                    return (
                                                        <Link target='_blank' href={`${part.url}`} className="cursor-pointer w-50 h-50 relative overflow-hidden rounded-md border border-gray-200 group-hover:opacity-70">
                                                            <Image
                                                                key={(part.filename || 'image') + i}
                                                                src={`${part.url ?? part.data}`}
                                                                alt={part.filename ?? 'image'}
                                                                width={500}
                                                                height={500}
                                                                className="rounded-md"
                                                                unoptimized
                                                            />
                                                        </Link>
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

                    {/* Dummy anchor div at the bottom */}
                    <div ref={bottomRef} />
                </div>
            </div>

            {/* Input area */}
            {allMessages.length !== 0 && (
                <div className="sticky bottom-0 z-20 bg-secondary">
                    <div className="max-w-6xl mx-auto px-1 py-4">
                        <PromptInputComponent
                            handleSubmit={handleSubmit}
                            setInput={setInput}
                            input={input}
                            status={status}
                            webSearch={webSearch}
                            setWebSearch={setWebSearch}
                            onImageSelect={handleImageSelect}
                            fileInputRef={fileInputRef}
                            isUploadingFile={isUploadingFile}
                            selectedImages={selectedImages}
                            removeImage={removeImage}
                            handleFileChange={handleFileChange}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatComponent;