/* eslint-disable @typescript-eslint/no-explicit-any */
export interface TextContent {
    type: "text";
    text: string;
    providerMetadata?: {
        openai?: {
            itemId: string;
        };
        // Add other providers as needed
        [key: string]: any;
    };
}

export interface UserMessageInterface {
    role: "user";
    content: TextContent[];
}

export interface AssistantMessageInterface {
    type: "text";
    text: string;
    providerMetadata?: {
        openai?: {
            itemId: string;
        };
        // Add other providers as needed
        [key: string]: any;
    };
}

export interface TokenUsage {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    reasoningTokens: number;
    cachedInputTokens: number;
}

// Individual message record interfaces
export interface UserMessageRecord {
    role: "user";
    content: TextContent[];
    userId: string;
    model: string;
    tokenUsage?: TokenUsage; // Optional for user messages
    conversationId?: string;
    timestamp: Date;
    messageId?: string;
}

export interface AssistantMessageRecord {
    role: "assistant";
    content: AssistantMessageInterface[];
    userId: string;
    model: string;
    tokenUsage: TokenUsage;
    conversationId?: string;
    timestamp: Date;
    messageId?: string;
}

// Combined interface for the API response
export interface SaveMessageInterface {
    userMessage: UserMessageInterface;
    assistantMessage: AssistantMessageInterface[];
    userId: string;
    totalUsage: TokenUsage;
    model: string;
}

// Function return type for creating separate records
export interface MessageRecords {
    userRecord: UserMessageRecord;
    assistantRecord: AssistantMessageRecord;
}

// Legacy interface for backward compatibility
export interface LegacySaveMessageInterface {
    userMessage: UserMessageInterface;
    assistantMessage: string | AssistantMessageInterface | AssistantMessageInterface[];
    userId: string;
    totalUsage: number | TokenUsage;
    text?: string;
    model: string;
    lastMessage?: UserMessageInterface;
}
