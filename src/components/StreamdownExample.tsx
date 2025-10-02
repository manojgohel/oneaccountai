'use client';

import { Response } from './response';

export function StreamdownExample() {

  const exampleMarkdown = `# Streamdown Features Demo

This is a comprehensive example of **Streamdown** capabilities with proper theming and configuration.

## Code Highlighting

Here's some JavaScript code with syntax highlighting:

\`\`\`javascript
function greetUser(name) {
  const message = \`Hello, \${name}!\`;
  console.log(message);
  return message;
}

// Call the function
greetUser("World");
\`\`\`

## Python Example

\`\`\`python
def calculate_fibonacci(n):
    if n <= 1:
        return n
    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)

# Calculate first 10 Fibonacci numbers
for i in range(10):
    print(f"F({i}) = {calculate_fibonacci(i)}")
\`\`\`

## Mermaid Diagrams

### Flowchart
\`\`\`mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[End]
\`\`\`

### Sequence Diagram
\`\`\`mermaid
sequenceDiagram
    participant User
    participant API
    participant Database

    User->>API: Request data
    API->>Database: Query
    Database-->>API: Results
    API-->>User: Response
\`\`\`

### Gantt Chart
\`\`\`mermaid
gantt
    title Project Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1
    Planning           :done,    plan1, 2024-01-01, 2024-01-10
    Design             :active,  design1, 2024-01-11, 2024-01-20
    section Phase 2
    Development        :         dev1, 2024-01-21, 2024-02-10
    Testing            :         test1, 2024-02-11, 2024-02-20
\`\`\`

## Tables

| Feature | Status | Priority |
|---------|--------|----------|
| Code Highlighting | ✅ Complete | High |
| Mermaid Diagrams | ✅ Complete | High |
| Math Rendering | ✅ Complete | Medium |
| Tables | ✅ Complete | Medium |
| Task Lists | ✅ Complete | Low |

## Task Lists

- [x] Install Streamdown
- [x] Configure theming
- [x] Add Mermaid support
- [x] Test code highlighting
- [ ] Add custom components
- [ ] Performance optimization

## Math Equations

Inline math: $E = mc^2$

Block math:
$$
\\sum_{i=1}^{n} x_i = x_1 + x_2 + \\cdots + x_n
$$

## Blockquotes

> This is a blockquote example. It demonstrates how Streamdown handles
> quoted text with proper styling and theming.

## Links and Images

[Visit Streamdown GitHub](https://github.com/vercel/streamdown)

## Strikethrough and Emphasis

~~This text is strikethrough~~ and this is **bold** and *italic*.

## Lists

### Unordered List
- First item
- Second item
  - Nested item
  - Another nested item
- Third item

### Ordered List
1. First step
2. Second step
3. Third step

## Streaming Example

This demonstrates how Streamdown handles incomplete markdown during streaming:

**Bold text that might be incomplete...**

*Italic text that could be cut off...*

\`Code that might not be finished...\`

## Custom Mermaid Configuration

You can customize Mermaid diagrams with your own theme:

\`\`\`mermaid
graph LR
    A[Custom Theme] --> B[Your Colors]
    B --> C[Brand Identity]
\`\`\`
`;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Streamdown Demo</h2>
        <Response>
          {exampleMarkdown}
        </Response>
      </div>
    </div>
  );
}
