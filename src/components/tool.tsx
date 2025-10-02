'use client';

import { cn } from '@/lib/utils';
import { WrenchIcon, ChevronDownIcon } from 'lucide-react';
import type { ComponentProps } from 'react';
import { useState } from 'react';

export type ToolProps = ComponentProps<'div'> & {
  toolName: string;
  toolCallId: string;
  variant?: 'input' | 'output';
};

export type ToolInputProps = ToolProps & {
  input: any;
};

export type ToolOutputProps = ToolProps & {
  output: any;
};

export const Tool = ({
  className,
  toolName,
  toolCallId,
  variant = 'input',
  children,
  ...props
}: ToolProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={cn(
        'border rounded-lg bg-muted/30 dark:bg-muted/10',
        className
      )}
      {...props}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 w-full p-3 text-left hover:bg-muted/50 transition-colors"
      >
        <WrenchIcon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          {toolName}
        </span>
        <div className="ml-auto text-xs text-muted-foreground">
          {variant === 'input' ? 'Input' : 'Output'}
        </div>
        <ChevronDownIcon
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform',
            isExpanded ? 'rotate-180' : 'rotate-0'
          )}
        />
      </button>

      {isExpanded && (
        <div className="border-t p-3">
          {children}
        </div>
      )}
    </div>
  );
};

export const ToolInput = ({
  className,
  input,
  ...props
}: ToolInputProps) => {
  const formatInput = (input: any): string => {
    if (typeof input === 'string') return input;
    if (typeof input === 'object') {
      return JSON.stringify(input, null, 2);
    }
    return String(input);
  };

  return (
    <Tool {...props} variant="input">
      <div className={cn('space-y-2', className)}>
        <div className="text-xs text-muted-foreground font-medium">Input:</div>
        <pre className="text-xs bg-background rounded p-2 overflow-auto max-h-48">
          {formatInput(input)}
        </pre>
      </div>
    </Tool>
  );
};

export const ToolOutput = ({
  className,
  output,
  ...props
}: ToolOutputProps) => {
  const formatOutput = (output: any): string => {
    if (typeof output === 'string') return output;
    if (typeof output === 'object') {
      return JSON.stringify(output, null, 2);
    }
    return String(output);
  };

  return (
    <Tool {...props} variant="output">
      <div className={cn('space-y-2', className)}>
        <div className="text-xs text-muted-foreground font-medium">Output:</div>
        <pre className="text-xs bg-background rounded p-2 overflow-auto max-h-48">
          {formatOutput(output)}
        </pre>
      </div>
    </Tool>
  );
};