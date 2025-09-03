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
import { useChat } from '@ai-sdk/react';
import {
    CopyIcon,
    HeartIcon,
    RefreshCcwIcon,
    ShareIcon,
    ThumbsDownIcon,
    ThumbsUpIcon
} from 'lucide-react';
import { useState } from 'react';
import PromptInputComponent from './PromptInputComponent';

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

    const mgss = [{ "parts": [{ "type": "text", "text": "generate article about india" }], "id": "3X2AvoeKJ3A0Woot", "role": "user" }, { "id": "gJHWVuZffj7ceZ3e", "role": "assistant", "parts": [{ "type": "step-start" }, { "type": "text", "text": "**India: A Tapestry of Diversity and Progress**\n\nIndia, a country known for its vibrant diversity and rich cultural heritage, stands as one of the most intriguing nations in the world. Located in South Asia, it is the seventh-largest country by land area and the most populous, home to over 1.4 billion people. India boasts a unique blend of traditions, languages, and religions, making it a fascinating mosaic of cultures.\n\n**Cultural Heritage**\n\nIndia's cultural heritage is one of its most defining features. The nation is renowned for its classical music, dance, art, and architecture. Iconic landmarks such as the Taj Mahal, a UNESCO World Heritage Site, exemplify the country's architectural brilliance. Diverse festivals like Diwali, Holi, Eid, and Christmas are celebrated with great fervor, highlighting the harmonious coexistence of multiple religious communities.\n\nLanguage is another pillar of India's cultural richness. While Hindi and English are the official languages, there are 21 other recognized regional languages and hundreds of dialects spoken across the country. This linguistic diversity reflects India's complex history and regional variations.\n\n**Economic Growth and Innovation**\n\nIn recent decades, India has emerged as a global economic powerhouse. It boasts the world's fifth-largest economy, driven by sectors such as information technology, telecommunications, textiles, and agriculture. Cities like Bangalore, Hyderabad, and Pune have become prominent IT hubs, often referred to as the \"Silicon Valley of India.\"\n\nThe country has also made significant strides in innovation and technology. With a vibrant startup ecosystem, India is nurturing a new generation of entrepreneurs who are driving technological advancements and addressing socio-economic challenges.\n\n**Challenges and Opportunities**\n\nDespite its impressive growth, India faces numerous challenges. Socio-economic disparities, poverty, and infrastructure deficits remain pressing issues. Additionally, the country grapples with environmental concerns, including pollution and sustainable resource management.\n\nHowever, India's challenges are accompanied by substantial opportunities. The government's focus on initiatives such as \"Digital India,\" \"Make in India,\" and \"Skill India\" aims to harness the potential of its youthful population. Moreover, India's commitment to renewable energy and sustainable development is paving the way for a cleaner and more sustainable future.\n\n**Political Landscape**\n\nIndia is the world's largest democracy, with a dynamic political landscape. The country's parliamentary system is characterized by multiple political parties and coalition governments. Regular elections at national and state levels ensure that democracy remains vibrant, though it occasionally faces challenges such as political polarization and the need for electoral reforms.\n\n**Conclusion**\n\nIndia's journey is marked by its ability to balance tradition with modernity, diversity with unity, and challenges with opportunities. As the nation continues to evolve on the global stage, it remains a land of endless possibilities, where ancient wisdom meets cutting-edge innovation. In the coming decades, India's role in global affairs and its contributions to the global economy, culture, and technology will undoubtedly continue to expand, solidifying its reputation as a key player on the world stage.", "providerMetadata": { "openai": { "itemId": "msg_68b85bc97b18819d83d73ea2b5aadacf080eea86112dcd5e" } }, "state": "done" }] }]


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
        <div className="flex min-h-full flex-col">
            {/* Messages Container */}
            <div className="flex-1 p-1">
                <div className="max-w-6xl mx-auto px-1">
                    {/* messages */}
                    {messages.map((message, messageIndex) => (
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
                                <MessageContent>
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
                                                            <Actions className={cn(
                                                                "mt-2 transition-opacity duration-200",
                                                                isLastMessage ? "opacity-100" : "opacity-0 group-hover:opacity-100"
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
                                                            </Actions>
                                                        )}
                                                    </div>
                                                );
                                            case 'reasoning':
                                                return (
                                                    <>
                                                        {status === 'streaming' && part.text &&
                                                            <Reasoning
                                                                key={`${message.id}-${i}`}
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

            {/* Input Footer - Now part of the same container */}
            <div className="sticky bottom-0 z-20 bg-background">
                <div className="max-w-6xl mx-auto px-1 py-4">
                    <PromptInputComponent
                        handleSubmit={handleSubmit}
                        setInput={setInput}
                        input={input}
                        setModel={setModel}
                        model={model}
                        models={models}
                        status={status}
                        webSearch={webSearch}
                        setWebSearch={setWebSearch}
                    />
                </div>
            </div>
        </div>
    );
};

export default ChatComponent;