/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

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
import { cn } from '@/lib/utils';
import { useGlobalContext } from '@/providers/context-provider';
import { useChat } from '@ai-sdk/react';
import {
    RefreshCcwIcon
} from 'lucide-react';
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
    const { state, setState } = useGlobalContext();

    useEffect(() => {
        if (conversations) {
            const { messages, ...rest } = conversations;
            setState((prev) => ({ ...prev, model: conversations.model, conversation: rest }));
        }
    }, [conversations?.model, setState]);

    // File upload state (from example)
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [isUploadingFile, setIsUploadingFile] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Message interactions
    const [likedMessages, setLikedMessages] = useState<Set<string>>(new Set());
    const [dislikedMessages, setDislikedMessages] = useState<Set<string>>(new Set());
    const [favoriteMessages, setFavoriteMessages] = useState<Set<string>>(new Set());

    // Improved scroll handling (from example)
    const chatContainerRef = useRef<HTMLDivElement | null>(null);
    const shouldScrollRef = useRef(true);

    const { messages, sendMessage, status, regenerate, setMessages } = useChat({
        messages: conversations?.messages || [],
        onFinish: () => {
            scrollToBottom();
        }
    });

    // Improved auto-scroll to bottom
    const scrollToBottom = useCallback(() => {
        if (chatContainerRef.current && shouldScrollRef.current) {
            const scrollElement = chatContainerRef.current;

            // Use both scrollTop and scrollIntoView for better reliability
            scrollElement.scrollTop = scrollElement.scrollHeight;

            setTimeout(() => {
                const lastMessage = scrollElement.lastElementChild?.lastElementChild;
                if (lastMessage) {
                    lastMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
                }
            }, 50);
        }
    }, []);

    // Enhanced auto-scroll when messages change
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => scrollToBottom(), 50);
            setTimeout(() => scrollToBottom(), 200);
            setTimeout(() => scrollToBottom(), 500);
        }
    }, [messages, scrollToBottom]);

    // Auto-scroll when status changes
    useEffect(() => {
        if ((status as any) === 'loading' || status === 'streaming') {
            scrollToBottom();
        }
    }, [status, scrollToBottom]);

    // Check if user is near bottom to decide whether to auto-scroll
    const handleScroll = useCallback(() => {
        if (chatContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
            shouldScrollRef.current = isNearBottom;
        }
    }, []);

    // Add/remove scroll listener
    useEffect(() => {
        const scrollElement = chatContainerRef.current;
        if (scrollElement) {
            scrollElement.addEventListener('scroll', handleScroll);
            return () => scrollElement.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    // File upload handlers (from example)
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
            // reset input so same file can be selected again
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    // Submit with images included (immediate display + send)
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed && selectedImages.length === 0) return;

        // Ensure auto-scroll will happen for new messages
        shouldScrollRef.current = true;

        if (selectedImages.length > 0) {
            // Build parts for immediate display
            const parts: any[] = [];
            if (trimmed) {
                parts.push({ type: 'text', text: trimmed });
            }
            selectedImages.forEach((file) => {
                parts.push({ type: 'image', image: `http://oneaccountai.com/api/file/${file}` });
            });

            const userMessageWithImages = {
                id: `user-${Date.now()}`,
                role: 'user' as const,
                content: trimmed,
                createdAt: new Date(),
                parts
            };
            console.log("🚀💡💡💡💡💡=====> ~ ChatComponent.tsx:187 ~ handleSubmit ~ userMessageWithImages:", userMessageWithImages);

            // Show immediately
            setMessages((prev) => [...prev, userMessageWithImages]);

            // Scroll down shortly after adding
            setTimeout(() => scrollToBottom(), 50);

            // Send to API
            sendMessage(
                { text: trimmed },
                {
                    body: {
                        model: state?.model || 'openai/gpt-4.1-mini',
                        webSearch,
                        conversationId,
                        images: selectedImages,
                    },
                },
            );
        } else {
            // Text-only
            sendMessage(
                { text: trimmed },
                {
                    body: {
                        model: state?.model || 'openai/gpt-4.1-mini',
                        webSearch,
                        conversationId,
                        images: [],
                    },
                },
            );
        }

        setInput('');
        setSelectedImages([]);

        // Ensure we scroll after sending
        setTimeout(() => scrollToBottom(), 100);
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

            {/* Messages Container - updated scroll refs/styles */}
            <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto overscroll-contain px-1 sm:px-2 py-1 scroll-smooth"
                style={{ scrollBehavior: 'smooth' }}
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
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img
                                                                src={part.image}
                                                                alt={`Message image ${i + 1}`}
                                                                className="w-full h-48 sm:h-56 lg:h-64 object-cover transition-transform group-hover:scale-105"
                                                                onLoad={() => setTimeout(() => scrollToBottom(), 50)}
                                                            />
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                                                                <div className="bg-white/90 dark:bg-black/90 rounded-full p-2">
                                                                    <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
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
                                            const isLastMessage = messageIndex === messages.length - 1;
                                            switch (part.type) {
                                                case 'text':
                                                    return (
                                                        <div key={`${message.id}-${i}`}>
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
                                                                        {/* <Action
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
                                                                        </Action> */}
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
                </div>
            </div>

            {/* Moved upload UI to PromptInputComponent; keep only the input area here */}
            <div className="sticky bottom-0 z-20 bg-background">
                <div className="max-w-6xl mx-auto px-1 py-4">
                    <PromptInputComponent
                        handleSubmit={handleSubmit}
                        setInput={setInput}
                        input={input}
                        status={status}
                        webSearch={webSearch}
                        setWebSearch={setWebSearch}
                        // file upload props
                        onImageSelect={handleImageSelect}
                        fileInputRef={fileInputRef}
                        isUploadingFile={isUploadingFile}
                        selectedImages={selectedImages}
                        removeImage={removeImage}
                        handleFileChange={handleFileChange}
                    />
                </div>
            </div>
        </div >
    );
};

export default ChatComponent;