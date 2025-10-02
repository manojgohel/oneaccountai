'use client';

import { cn } from '@/lib/utils';
import { AlertTriangleIcon } from 'lucide-react';
import type { ComponentProps } from 'react';

export type ErrorProps = ComponentProps<'div'> & {
  errorText: string;
  variant?: 'default' | 'destructive' | 'warning';
};

export const Error = ({
  className,
  errorText,
  variant = 'destructive',
  ...props
}: ErrorProps) => {
  const variantStyles = {
    default: 'bg-muted text-muted-foreground border-muted-foreground/20',
    destructive: 'bg-destructive/10 text-destructive border-destructive/20',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-800/20'
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <AlertTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium">Error</p>
        <p className="text-sm mt-1">{errorText}</p>
      </div>
    </div>
  );
};
