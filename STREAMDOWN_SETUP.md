# AI SDK UI Stream Protocol Implementation

This document explains the implementation of the AI SDK UI Stream Protocol standards in the OneAccountAI chat application.

## Overview

The implementation follows the [AI SDK UI Stream Protocol](https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol) standards to handle different types of message parts that can be streamed from the backend to the frontend.

## Supported Part Types

### 1. Text Parts (`text`)
- **Type**: `text`
- **Purpose**: Basic text content
- **Component**: `Response` component with Streamdown
- **Example**:
```typescript
{
  type: "text",
  text: "Hello, how can I help you today?"
}
```

### 2. Reasoning Parts (`reasoning`)
- **Type**: `reasoning`
- **Purpose**: AI reasoning/thinking process
- **Component**: `Reasoning` with collapsible content
- **Example**:
```typescript
{
  type: "reasoning",
  text: "I need to analyze this request and provide a comprehensive answer..."
}
```

### 3. Source Parts
#### Source URL (`source-url`)
- **Type**: `source-url`
- **Purpose**: External URL references
- **Component**: `Sources` with `Source` links
- **Example**:
```typescript
{
  type: "source-url",
  sourceId: "https://example.com",
  url: "https://example.com"
}
```

#### Source Document (`source-document`)
- **Type**: `source-document`
- **Purpose**: Document/file references
- **Component**: `Sources` with `Source` links
- **Example**:
```typescript
{
  type: "source-document",
  sourceId: "doc-123",
  mediaType: "application/pdf",
  title: "Document Title"
}
```

### 4. File Parts (`file`)
- **Type**: `file`
- **Purpose**: File attachments (images, PDFs, etc.)
- **Component**: Custom file display with icons and actions
- **Example**:
```typescript
{
  type: "file",
  url: "https://example.com/file.jpg",
  mediaType: "image/jpeg",
  filename: "image.jpg"
}
```

### 5. Error Parts (`error`)
- **Type**: `error`
- **Purpose**: Error messages and notifications
- **Component**: `Error` component with alert styling
- **Example**:
```typescript
{
  type: "error",
  errorText: "An error occurred while processing your request."
}
```

### 6. Data Parts (`data-*`)
- **Type**: `data-{customType}`
- **Purpose**: Custom structured data
- **Component**: `Data` component with collapsible JSON view
- **Example**:
```typescript
{
  type: "data-weather",
  data: { location: "SF", temperature: 22, condition: "sunny" }
}
```

### 7. Tool Parts
#### Tool Input (`tool-input`)
- **Type**: `tool-input`
- **Purpose**: Tool execution input parameters
- **Component**: `ToolInput` component
- **Example**:
```typescript
{
  type: "tool-input",
  toolCallId: "call_123",
  toolName: "getWeather",
  input: { city: "San Francisco" }
}
```

#### Tool Output (`tool-output`)
- **Type**: `tool-output`
- **Purpose**: Tool execution results
- **Component**: `ToolOutput` component
- **Example**:
```typescript
{
  type: "tool-output",
  toolCallId: "call_123",
  output: { temperature: 22, condition: "sunny" }
}
```

## Implementation Details

### Message Interface
The `MessagePart` union type in `/src/interface/message.interface.ts` defines all supported part types:

```typescript
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
```

### Chat Component
The `ChatComponent` in `/src/modules/ai/ChatComponent.tsx` handles rendering of all part types:

```typescript
switch (part.type) {
  case 'text':
    return <Response>{part.text}</Response>;
  case 'reasoning':
    return <Reasoning>...</Reasoning>;
  case 'error':
    return <Error errorText={part.errorText} />;
  case 'tool-input':
    return <ToolInput {...part} />;
  // ... other cases
}
```

### Components Created

1. **Error Component** (`/src/components/error.tsx`)
   - Handles error display with different variants
   - Supports destructive, warning, and default styles

2. **Data Component** (`/src/components/data.tsx`)
   - Displays custom data with collapsible JSON view
   - Supports different data types and formatting

3. **Tool Components** (`/src/components/tool.tsx`)
   - `ToolInput`: Shows tool input parameters
   - `ToolOutput`: Shows tool execution results
   - Both support collapsible views and JSON formatting

4. **Response Component** (Updated)
   - Enhanced with variant support for different content types
   - Maintains Streamdown integration for markdown rendering

## Usage Example

```typescript
// Example message with multiple part types
const message = {
  id: 'example',
  role: 'assistant',
  parts: [
    { type: 'text', text: 'Here is your response...' },
    { type: 'reasoning', text: 'I analyzed the request...' },
    { type: 'source-url', sourceId: 'https://example.com', url: 'https://example.com' },
    { type: 'file', url: 'https://example.com/file.jpg', mediaType: 'image/jpeg' },
    { type: 'error', errorText: 'Something went wrong' },
    { type: 'data-weather', data: { temp: 22, condition: 'sunny' } }
  ]
};
```

## Backend Integration

To use these components, your backend should send messages with the appropriate part types according to the AI SDK UI Stream Protocol. The frontend will automatically render each part type using the corresponding component.

## Styling

All components follow the existing design system with:
- Consistent spacing and typography
- Dark/light mode support
- Responsive design
- Accessibility features
- Smooth animations and transitions

## Testing

Use the `StreamdownExample` component to test all part types:

```typescript
import { StreamdownExample } from '@/components/StreamdownExample';

// In your component
<StreamdownExample />
```

This implementation ensures full compliance with the AI SDK UI Stream Protocol standards while maintaining a consistent user experience across all message part types.