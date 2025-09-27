/* eslint-disable @typescript-eslint/no-unused-vars */

'use client';

import { getMessages } from '@/actions/conversation/message.action';
import { uploadToS3 } from '@/actions/upload.action';
import { Loader, TypingLoader } from '@/components/loader';
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
import { useGlobalContext } from '@/providers/context-provider';
import { getMediaTypeFromUrl } from '@/utils/common';
import { useChat } from '@ai-sdk/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    ChevronUpIcon
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import MessageActionsButtons from './MessageActionsButtons';
import PromptInputComponent from './PromptInputComponent';


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
    const [isStreaming, setIsStreaming] = useState(false);

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
        },
    });

    // Initialize conversation data
    useEffect(() => {
        if (conversations && !isInitialized) {
            const { messages: conversationMessages, ...rest } = conversations;
            setState((prev) => ({ ...prev, model: conversations.model, conversation: rest }));

            if (conversationMessages && conversationMessages.length > 0) {
                setAllMessages(conversationMessages);
                setMessages(conversationMessages);
                setPaginationCursor(conversationMessages[0]._id ?? conversationMessages[0].id);

                setTimeout(() => {
                    scrollToBottom();
                }, 100);
            }
            setIsInitialized(true);
        }
    }, [conversations, setState, setMessages, isInitialized]);

    // Handle loading state for different scenarios
    const isMessagesLoading = status === 'submitted' || (!isInitialized && conversations);
    const hasMessages = allMessages.length > 0;
    const isNewConversation = !conversations || (conversations?.messages?.length === 0);

    // Query for loading more messages
    const { data: paginatedData, refetch: refetchMessages, isFetching } = useQuery({
        queryKey: ['paginated-messages', conversationId, paginationCursor],
        enabled: false,
        queryFn: () => getMessages({
            conversationId: conversationId ?? '',
            limit: 10,
            lastId: paginationCursor ?? ""
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

                setHasMoreMessages(result.data.pagination?.hasMore ?? false);
                if (result.data.pagination?.hasMore) {
                    setPaginationCursor(newMessages[0]._id ?? newMessages[0].id);
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
            // Trigger scroll when new messages arrive
            if (shouldScrollToBottom) {
                setTimeout(() => scrollToBottom(), 100);
            }
        }
    }, [messages, allMessages.length, isLoadingMore, shouldScrollToBottom]);

    // Removed duplicate scroll effect - handled in comprehensive scroll management below

    // Track streaming state
    useEffect(() => {
        setIsStreaming(status === 'streaming');
    }, [status]);

    // Single comprehensive scroll management - prevents multiple scroll effects
    useEffect(() => {
        if (shouldScrollToBottom && !isLoadingMore && containerRef.current) {
            // Use immediate scroll without smooth behavior to prevent conflicts
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [allMessages.length, shouldScrollToBottom, isLoadingMore]);

    // Removed duplicate scroll effect - handled in comprehensive scroll management above

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
            console.log("🚀💡💡💡💡💡=====> ~ ChatComponent.tsx:204 ~ handleFileChange ~ result:", result);

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
        // Immediately scroll to bottom when user submits
        setTimeout(() => scrollToBottom(), 50);

        const parts: any[] = [
            ...(
                selectedImages.length > 0
                    ? selectedImages.map((file) => ({
                        type: 'file',
                        mediaType: getMediaTypeFromUrl(file),
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
                    model: state?.model ?? 'openai/gpt-4.1-mini',
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
        if (!containerRef.current) return;

        const container = containerRef.current;

        // Immediate scroll to bottom to prevent multiple scroll effects
        container.scrollTop = container.scrollHeight;
    };

    const scrollToTop = () => {
        if (containerRef.current) {
            containerRef.current.scrollTop = 0;
        }
    };

    const greeting = useGreeting();

    return (
        <div className="flex flex-1 flex-col bg-secondary h-full overflow-hidden">
            {/* Loading Messages - Show when loading saved messages */}
            {isMessagesLoading && !hasMessages && (
                <div className="flex flex-1 items-center justify-center w-full min-h-[40vh]">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 dark:border-blue-800"></div>
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-transparent border-t-blue-500 absolute top-0 left-0"></div>
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-slate-600 dark:text-slate-400 font-medium">
                                {isNewConversation ? 'Initializing chat...' : 'Loading messages...'}
                            </p>
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* No Messages Welcome Screen - Show when no messages and not loading */}
            {!isMessagesLoading && !hasMessages && status !== 'streaming' && (
                <div className="flex flex-1 items-center justify-center w-full min-h-[40vh]">
                    <div className="w-full max-w-4xl px-4">
                        <div className="text-center space-y-4">
                            <div className="space-y-3">
                                <div className="h-12 w-12 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
                                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <h1 className='text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
                                    {greeting}, {state?.user?.name ?? state?.user?.email ?? "Guest"}
                                </h1>
                                <p className="text-slate-600 dark:text-slate-400 text-base max-w-2xl mx-auto">
                                    Start a conversation with AI. Ask questions, get help, or explore new ideas.
                                </p>
                            </div>
                            <PromptInputComponent
                                handleSubmit={handleSubmit}
                                setInput={setInput}
                                input={input}
                                status={isMessagesLoading ? 'loading' : status}
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
                </div>
            )}

            {/* Messages Container - Only show when there are messages */}
            {allMessages.length > 0 && (
                <div
                    ref={containerRef}
                    className="flex-1 overflow-y-auto px-1 sm:px-2 py-1 bg-secondary"
                    style={{
                        height: "calc(100vh - 120px)",
                        minHeight: "350px"
                    }}
                    onScroll={(e) => {
                        // Check if user is near bottom with better threshold
                        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                        const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
                        setShouldScrollToBottom(isNearBottom);
                    }}
                >
                <div className="max-w-6xl mx-auto px-1 min-h-[75vh] pb-8" style={{ scrollBehavior: 'smooth' }}>
                    {/* Load More Button */}
                    {hasMoreMessages && allMessages.length > 0 && (
                        <div className="flex justify-center py-3">
                            <Button
                                onClick={handleLoadMore}
                                disabled={isLoadingMore}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 hover:scale-105 shadow-sm border-slate-200 dark:border-slate-700"
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
                    {allMessages?.map((message, messageIndex) => (
                        <div key={message.id ?? message._id} className="mb-4">
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
                            <Message from={message.role} key={message.id ?? message._id}>
                                <MessageContent key={`${message.id}-content`}>
                                    {/* Files grid (images, PDFs, and other files) */}
                                    {message.parts?.some((part: any) => part.type === 'file') && (
                                        <div className="mb-4">
                                            <div className="flex flex-wrap gap-2">
                                                {message.parts
                                                    ?.filter((part: any) => part.type === 'file')
                                                    .map((part: any, i: number) => {
                                                        const isImage = part.mediaType?.startsWith('image/') ||
                                                            part.url?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
                                                        const isPDF = part.mediaType === 'application/pdf' ||
                                                            part.url?.match(/\.pdf$/i);

                                                        return (
                                                            <div
                                                                key={`${message.id}-file-${i}`}
                                                                className="group relative inline-flex items-center gap-2 p-2 rounded-lg border bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer max-w-[200px]"
                                                            >
                                                                {/* File Icon */}
                                                                <div className="flex-shrink-0">
                                                                    {isImage ? (
                                                                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                        </svg>
                                                                    ) : isPDF ? (
                                                                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                                                            <path d="M8.267 14.68c-.184 0-.308.018-.372.036v1.178c.076.018.171.023.302.023.479 0 .774-.242.774-.651 0-.366-.254-.586-.704-.586zm3.487.012c-.2 0-.33.018-.407.036v2.61c.077.018.201.018.313.018.817.006 1.349-.444 1.349-1.396.006-.83-.479-1.268-1.255-1.268z" />
                                                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM9.498 16.19c-.309.29-.765.42-1.296.42a2.23 2.23 0 0 1-.308-.018v1.426H7v-3.936A7.558 7.558 0 0 1 8.219 14c.557 0 .953.106 1.22.319.254.202.426.533.426.923-.001.392-.131.723-.367.948zm3.807 1.355c-.42.349-1.059.515-1.84.515-.468 0-.799-.03-1.024-.06v-3.917A7.947 7.947 0 0 1 11.66 14c.757 0 1.249.136 1.633.426.415.308.675.799.675 1.504 0 .763-.279 1.29-.663 1.615zM17 14.77h-1.532v.911H16.9v.734h-1.432v1.604h-.906V14.03H17v.74zM14 9h-1V4l5 5h-4z" />
                                                                        </svg>
                                                                    ) : (
                                                                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                        </svg>
                                                                    )}
                                                                </div>

                                                                {/* Filename */}
                                                                <span className="text-xs text-gray-700 dark:text-gray-300 truncate flex-1 min-w-0">
                                                                    {part.filename || (isImage ? 'Image' : isPDF ? 'PDF Document' : 'Document')}
                                                                </span>

                                                                {/* Actions */}
                                                                <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    {/* View button for images and PDFs */}
                                                                    {(isImage || isPDF) && (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                window.open(part.url, '_blank');
                                                                            }}
                                                                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                                                            title={isImage ? "View Image" : "View PDF"}
                                                                        >
                                                                            <svg className="w-3 h-3 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                            </svg>
                                                                        </button>
                                                                    )}

                                                                    {/* Download button */}
                                                                    <a
                                                                        href={part.url}
                                                                        download={part.filename || 'document'}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                                                        title="Download File"
                                                                    >
                                                                        <svg className="w-3 h-3 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                        </svg>
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                }
                                            </div>
                                        </div>
                                    )}

                                    {/* Text and other parts (exclude files) */}
                                    {message.parts
                                        ?.filter((part: any) => part.type !== 'image' && part.type !== 'file')
                                        .map((part: any, i: number) => {
                                            const isLastMessage = messageIndex === allMessages.length - 1;
                                            switch (part.type) {
                                                case 'text':
                                                    return (
                                                        <div key={`${message.id}-${i}`} >
                                                            <Response>{part.text}</Response>
                                                            {message.role === 'assistant' && (
                                                                <MessageActionsButtons
                                                                    regenerate={regenerate}
                                                                    isLastMessage={isLastMessage}
                                                                    message={message}
                                                                    tokenPopoverOpen={tokenPopoverOpen}
                                                                    setTokenPopoverOpen={setTokenPopoverOpen}
                                                                    status={status} />
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
                                                default:
                                                    return null;
                                            }
                                        })}
                                </MessageContent>
                            </Message>
                        </div>
                    ))}

                    {status === 'submitted' && (
                        <div className="flex items-start justify-start py-4">
                            <TypingLoader />
                        </div>
                    )}

                    {/* Dummy anchor div at the bottom with proper spacing */}
                    <div ref={bottomRef} className="h-20" />
                </div>
                </div>
            )}

            {/* Input area */}
            {allMessages.length !== 0 && (
                <div className="sticky bottom-0 z-20">
                    <div className="max-w-6xl mx-auto px-1 py-2">
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