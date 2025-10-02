'use client';

import { cn } from '@/lib/utils';
import { type ComponentProps, memo } from 'react';
import { Streamdown } from 'streamdown';

type ResponseProps = ComponentProps<typeof Streamdown> & {
  variant?: 'default' | 'text' | 'code' | 'markdown';
};

export const Response = memo(
  ({ className, variant = 'default', ...props }: ResponseProps) => {
    const variantStyles = {
      default: 'size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 chat-text',
      text: 'size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 chat-text prose prose-sm max-w-none',
      code: 'size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 chat-text font-mono text-sm',
      markdown: 'size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 chat-text prose prose-sm max-w-none'
    };

    return (
      <Streamdown
        shikiTheme={["github-light", "github-dark"]}
        parseIncompleteMarkdown={true}
        className={cn(
          variantStyles[variant],
          // Enhanced styling for better readability
          '[&_pre]:bg-transparent [&_pre]:border [&_pre]:rounded-lg [&_pre]:p-4',
          '[&_code]:bg-transparent [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm',
          '[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic',
          '[&_table]:border-collapse [&_table]:w-full [&_table]:border [&_table]:rounded-lg',
          '[&_th]:border [&_th]:bg-muted [&_th]:p-2 [&_th]:text-left [&_th]:font-semibold',
          '[&_td]:border [&_td]:p-2',
          '[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary/80',
          '[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6',
          '[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-5',
          '[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-4',
          '[&_h4]:text-base [&_h4]:font-semibold [&_h4]:mb-2 [&_h4]:mt-3',
          '[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4',
          '[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4',
          '[&_li]:mb-1',
          '[&_p]:mb-3 [&_p]:leading-relaxed',
          className
        )}
        {...props}
      />
    );
  },
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

Response.displayName = 'Response';
