'use client';

import { Action, Actions } from '@/components/actions';
import {
    Conversation,
    ConversationContent,
    ConversationScrollButton,
} from '@/components/conversation';
import { Loader } from '@/components/loader';
import { Message, MessageContent } from '@/components/message';
import {
    PromptInput,
    PromptInputButton,
    PromptInputModelSelect,
    PromptInputModelSelectContent,
    PromptInputModelSelectItem,
    PromptInputModelSelectTrigger,
    PromptInputModelSelectValue,
    PromptInputSubmit,
    PromptInputTextarea,
    PromptInputToolbar,
    PromptInputTools,
} from '@/components/prompt-input';
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
import { useChat } from '@ai-sdk/react';
import {
    CopyIcon,
    GlobeIcon,
    HeartIcon,
    RefreshCcwIcon,
    ShareIcon,
    ThumbsDownIcon,
    ThumbsUpIcon
} from 'lucide-react';
import { useState } from 'react';

// const models = [
//     {
//         name: 'GPT 4o',
//         value: 'openai/gpt-4o',
//     },
//     {
//         name: 'Deepseek R1',
//         value: 'deepseek/deepseek-r1',
//     },
// ];

interface ModelOption {
    id: string;
    name: string;
}

interface ChatComponentProps {
    models: ModelOption[];
}

const ChatComponent = ({ models }: ChatComponentProps) => {
    const [input, setInput] = useState('');
    const [model, setModel] = useState<string>("openai/gpt-4o");
    const [webSearch, setWebSearch] = useState(false);

    // State for message interactions
    const [likedMessages, setLikedMessages] = useState<Set<string>>(new Set());
    const [dislikedMessages, setDislikedMessages] = useState<Set<string>>(new Set());
    const [favoriteMessages, setFavoriteMessages] = useState<Set<string>>(new Set());

    const { messages, sendMessage, status, regenerate } = useChat();

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
                        model: model,
                        webSearch: webSearch,
                    },
                },
            );
            setInput('');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 relative size-full h-screen">
            <div className="flex flex-col h-full">
                <Conversation className="h-full">
                    <ConversationContent>
                        {messages.map((message, messageIndex) => (
                            <div key={message.id}>
                                {message.role === 'assistant' && (
                                    <Sources>
                                        <SourcesTrigger
                                            count={
                                                message.parts.filter(
                                                    (part) => part.type === 'source-url',
                                                ).length
                                            }
                                        />
                                        {message.parts.filter((part) => part.type === 'source-url').map((part, i) => (
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
                                    <MessageContent>
                                        {message.parts.map((part, i) => {
                                            const isLastMessage = messageIndex === messages.length - 1;
                                            switch (part.type) {
                                                case 'text':
                                                    return (
                                                        <div key={`${message.id}-${i}`}>
                                                            <Response>
                                                                {part.text}
                                                            </Response>
                                                            {message.role === 'assistant' && (
                                                                <Actions className={cn(
                                                                    "mt-2 transition-opacity duration-200",
                                                                    isLastMessage ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                                                )}>
                                                                    <Action
                                                                        onClick={() => regenerate()}
                                                                        tooltip="Retry"
                                                                        label="Retry"
                                                                        disabled={!isLastMessage || status === 'streaming'}
                                                                    >
                                                                        <RefreshCcwIcon className="size-3" />
                                                                    </Action>
                                                                    <Action
                                                                        onClick={() => handleCopy(part.text)}
                                                                        tooltip="Copy"
                                                                        label="Copy"
                                                                    >
                                                                        <CopyIcon className="size-3" />
                                                                    </Action>
                                                                    <Action
                                                                        onClick={() => handleLike(message.id)}
                                                                        tooltip="Like"
                                                                        label="Like"
                                                                        variant={likedMessages.has(message.id) ? 'default' : 'ghost'}
                                                                    >
                                                                        <ThumbsUpIcon className="size-3" />
                                                                    </Action>
                                                                    <Action
                                                                        onClick={() => handleDislike(message.id)}
                                                                        tooltip="Dislike"
                                                                        label="Dislike"
                                                                        variant={dislikedMessages.has(message.id) ? 'default' : 'ghost'}
                                                                    >
                                                                        <ThumbsDownIcon className="size-3" />
                                                                    </Action>
                                                                    <Action
                                                                        onClick={() => handleShare(part.text)}
                                                                        tooltip="Share"
                                                                        label="Share"
                                                                    >
                                                                        <ShareIcon className="size-3" />
                                                                    </Action>
                                                                    <Action
                                                                        onClick={() => handleFavorite(message.id)}
                                                                        tooltip="Favorite"
                                                                        label="Favorite"
                                                                        variant={favoriteMessages.has(message.id) ? 'default' : 'ghost'}
                                                                    >
                                                                        <HeartIcon className="size-3" />
                                                                    </Action>
                                                                </Actions>
                                                            )}
                                                        </div>
                                                    );
                                                case 'reasoning':
                                                    return (
                                                        <Reasoning
                                                            key={`${message.id}-${i}`}
                                                            className="w-full"
                                                            isStreaming={status === 'streaming'}
                                                        >
                                                            <ReasoningTrigger />
                                                            <ReasoningContent>{part.text}</ReasoningContent>
                                                        </Reasoning>
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
                    </ConversationContent>
                    <ConversationScrollButton />
                </Conversation>

                <PromptInput onSubmit={handleSubmit} className="mt-4">
                    <PromptInputTextarea
                        onChange={(e) => setInput(e.target.value)}
                        value={input}
                    />
                    <PromptInputToolbar>
                        <PromptInputTools>
                            <PromptInputButton
                                variant={webSearch ? 'default' : 'ghost'}
                                onClick={() => setWebSearch(!webSearch)}
                            >
                                <GlobeIcon size={16} />
                                <span>Search</span>
                            </PromptInputButton>
                            <PromptInputModelSelect
                                onValueChange={(value) => {
                                    setModel(value);
                                }}
                                value={model}
                            >
                                <PromptInputModelSelectTrigger>
                                    <PromptInputModelSelectValue />
                                </PromptInputModelSelectTrigger>
                                <PromptInputModelSelectContent>
                                    {models.map((model) => (
                                        <PromptInputModelSelectItem key={model.id} value={model.id}>
                                            {model.name}
                                        </PromptInputModelSelectItem>
                                    ))}
                                </PromptInputModelSelectContent>
                            </PromptInputModelSelect>
                        </PromptInputTools>
                        <PromptInputSubmit disabled={!input} status={status} />
                    </PromptInputToolbar>
                </PromptInput>
            </div>
        </div>
    );
};

export default ChatComponent;