/* eslint-disable @typescript-eslint/no-explicit-any */

// AI SDK UI Stream Protocol Part Types
export interface TextPart {
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

export interface ReasoningPart {
    type: "reasoning";
    text: string;
}

export interface SourceUrlPart {
    type: "source-url";
    sourceId: string;
    url: string;
}

export interface SourceDocumentPart {
    type: "source-document";
    sourceId: string;
    mediaType: string;
    title: string;
}

export interface FilePart {
    type: "file";
    url: string;
    mediaType: string;
    filename?: string;
}

export interface ErrorPart {
    type: "error";
    errorText: string;
}

export interface DataPart {
    type: `data-${string}`;
    data: any;
}

export interface ToolInputPart {
    type: "tool-input";
    toolCallId: string;
    toolName: string;
    input: any;
}

export interface ToolOutputPart {
    type: "tool-output";
    toolCallId: string;
    output: any;
}

// Union type for all possible message parts
export type MessagePart =
    | TextPart
    | ReasoningPart
    | SourceUrlPart
    | SourceDocumentPart
    | FilePart
    | ErrorPart
    | DataPart
    | ToolInputPart
    | ToolOutputPart;

// Message Metadata Types
export interface MessageMetadata {
    createdAt?: number;
    model?: string;
    totalTokens?: number;
    inputTokens?: number;
    outputTokens?: number;
    finishReason?: string;
    generationTime?: number;
}

// Legacy interface for backward compatibility
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
