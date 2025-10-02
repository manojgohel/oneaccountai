'use client';

import { cn } from '@/lib/utils';
import { DatabaseIcon } from 'lucide-react';
import type { ComponentProps } from 'react';
import { useState } from 'react';

export type DataProps = ComponentProps<'div'> & {
  data: any;
  dataType: string;
  title?: string;
};

export const Data = ({
  className,
  data,
  dataType,
  title,
  ...props
}: DataProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatData = (data: any): string => {
    if (typeof data === 'string') return data;
    if (typeof data === 'object') {
      return JSON.stringify(data, null, 2);
    }
    return String(data);
  };

  const isJsonObject = typeof data === 'object' && data !== null;

  return (
    <div
      className={cn(
        'border rounded-lg bg-muted/50 dark:bg-muted/20',
        className
      )}
      {...props}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 w-full p-3 text-left hover:bg-muted/80 transition-colors"
      >
        <DatabaseIcon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          {title || `${dataType} Data`}
        </span>
        <div className="ml-auto text-xs text-muted-foreground">
          {isJsonObject ? 'JSON' : typeof data}
        </div>
        <svg
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform',
            isExpanded ? 'rotate-180' : 'rotate-0'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isExpanded && (
        <div className="border-t p-3">
          <pre className="text-xs bg-background rounded p-2 overflow-auto max-h-64">
            {formatData(data)}
          </pre>
        </div>
      )}
    </div>
  );
};
