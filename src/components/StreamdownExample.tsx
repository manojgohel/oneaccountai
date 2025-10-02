'use client';

import { Error } from '@/components/error';
import { Data } from '@/components/data';
import { ToolInput, ToolOutput } from '@/components/tool';
import { Response } from '@/components/response';
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/reasoning';
import { Sources, SourcesContent, SourcesTrigger, Source } from '@/components/sources';
import { Message, MessageContent } from '@/components/message';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

/**
 * Example component demonstrating all AI SDK UI Stream Protocol part types
 * This shows how different message parts are rendered according to the standards
 */
export const StreamdownExample = () => {
  const [showExample, setShowExample] = useState(false);

  // Example message with all possible part types
  const exampleMessage = {
    id: 'example-message',
    role: 'assistant' as const,
    parts: [
      // Text part
      {
        type: 'text',
        text: 'Here\'s a comprehensive example of all the AI SDK UI Stream Protocol part types:'
      },
      // Reasoning part
      {
        type: 'reasoning',
        text: 'I need to demonstrate all the different part types that can be streamed according to the AI SDK UI standards. This includes text, reasoning, sources, files, errors, data, and tool parts.'
      },
      // Source URL part
      {
        type: 'source-url',
        sourceId: 'https://ai-sdk.dev',
        url: 'https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol'
      },
      // Source document part
      {
        type: 'source-document',
        sourceId: 'doc-123',
        mediaType: 'application/pdf',
        title: 'AI SDK Documentation'
      },
      // File part
      {
        type: 'file',
        url: 'https://example.com/image.jpg',
        mediaType: 'image/jpeg',
        filename: 'example-image.jpg'
      },
      // Tool input part
      {
        type: 'tool-input',
        toolCallId: 'call_123',
        toolName: 'getWeather',
        input: { city: 'San Francisco', unit: 'celsius' }
      },
      // Tool output part
      {
        type: 'tool-output',
        toolCallId: 'call_123',
        output: { temperature: 22, condition: 'sunny', humidity: 65 }
      },
      // Custom data part
      {
        type: 'data-weather',
        data: { location: 'SF', temperature: 22, condition: 'sunny' }
      },
      // Error part
      {
        type: 'error',
        errorText: 'This is an example error message to demonstrate error handling.'
      }
    ]
  };

  if (!showExample) {
    return (
      <div className="p-4">
        <Button onClick={() => setShowExample(true)}>
          Show AI SDK UI Stream Protocol Example
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">AI SDK UI Stream Protocol Example</h2>
        <Button variant="outline" onClick={() => setShowExample(false)}>
          Hide Example
        </Button>
      </div>

      <div className="space-y-4">
        <Message from="assistant">
          <MessageContent>
            {/* Sources */}
            <Sources>
              <SourcesTrigger count={2} />
              <SourcesContent>
                <Source
                  href="https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol"
                  title="AI SDK Stream Protocol Documentation"
                />
                <Source
                  href="doc-123"
                  title="AI SDK Documentation"
                />
              </SourcesContent>
            </Sources>

            {/* Files */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                <div className="group relative inline-flex items-center gap-2 p-2 rounded-lg border bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer max-w-[200px]">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-700 dark:text-gray-300 truncate flex-1 min-w-0">
                    example-image.jpg
                  </span>
                </div>
              </div>
            </div>

            {/* Text content */}
            <Response>Here's a comprehensive example of all the AI SDK UI Stream Protocol part types:</Response>

            {/* Reasoning */}
            <Reasoning>
              <ReasoningTrigger />
              <ReasoningContent>
                I need to demonstrate all the different part types that can be streamed according to the AI SDK UI standards. This includes text, reasoning, sources, files, errors, data, and tool parts.
              </ReasoningContent>
            </Reasoning>

            {/* Tool Input */}
            <ToolInput
              toolName="getWeather"
              toolCallId="call_123"
              input={{ city: 'San Francisco', unit: 'celsius' }}
            />

            {/* Tool Output */}
            <ToolOutput
              toolName="getWeather"
              toolCallId="call_123"
              output={{ temperature: 22, condition: 'sunny', humidity: 65 }}
            />

            {/* Custom Data */}
            <Data
              data={{ location: 'SF', temperature: 22, condition: 'sunny' }}
              dataType="weather"
              title="Weather Data"
            />

            {/* Error */}
            <Error
              errorText="This is an example error message to demonstrate error handling."
              variant="destructive"
            />
          </MessageContent>
        </Message>
      </div>
    </div>
  );
};