/* eslint-disable @next/next/no-img-element */
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
import { FILE_URL } from '@/consts/ai.consts';
import { useGreeting } from '@/hooks/use-get-greeting';
import { cn } from '@/lib/utils';
import { useGlobalContext } from '@/providers/context-provider';
import { useChat } from '@ai-sdk/react';
import { useQueryClient } from '@tanstack/react-query';
import {
    RefreshCcwIcon
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
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

    const queryClient = useQueryClient();
    const { messages, sendMessage, status, regenerate, setMessages } = useChat({
        messages: conversations?.messages || [],
        onFinish: () => {
            // scrollToBottom();
            scrollToBottom();
            if (messages && messages.length < 2) {
                queryClient.invalidateQueries({ queryKey: ["conversationMetaData"] });
                queryClient.invalidateQueries({ queryKey: ['conversations'] });
            }

        }
    });

    useEffect(() => {
        // scrollToBottom();
        scrollToBottom();
    }, [messages, status]);




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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed) return;

        // Build message parts for ModelMessage format
        const parts: any = [
            ...(
                selectedImages.length > 0
                    ? selectedImages.map((file) => ({
                        type: 'file',
                        mediaType: 'image/png', // Or dynamically set based on file type
                        url: `${FILE_URL}${file}`, // Or use file blobs/data URLs if required
                        filename: file
                    }))
                    : []
            ),
            ...(trimmed ? [{ type: 'text', text: trimmed }] : [])
        ];
        console.log("🚀💡💡💡💡💡=====> ~ ChatComponent.tsx:247 ~ handleSubmit ~ parts:", parts);

        // Send ModelMessage to the API (no top-level images key)
        sendMessage(
            {
                role: 'user',
                parts
            },
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
            }, 50); // small delay
        }
    };
    const greeting = useGreeting();



    return (
        <div className="flex min-h-full flex-col bg-secondary">
            {messages.length === 0 && status !== 'streaming' && (
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
            )}
            {/* Messages Container - updated scroll refs/styles */}
            <div
                ref={containerRef}
                style={{ scrollBehavior: "smooth" }}
                className="flex-1 overflow-y-auto overscroll-contain px-1 sm:px-2 py-1 scroll-smooth bg-secondary"
            >
                <div className="max-w-6xl mx-auto px-1 h-[75vh]" style={{ scrollBehavior: 'smooth' }}>
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
                                                            { }
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

            {/* Moved upload UI to PromptInputComponent; keep only the input area here */}
            {messages.length !== 0 && (
                <div className="sticky bottom-0 z-20 bg-secondary" >
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
            )}

        </div >
    );
};

export default ChatComponent;