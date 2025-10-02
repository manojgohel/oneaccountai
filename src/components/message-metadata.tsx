'use client';

import { cn } from '@/lib/utils';
import { ClockIcon, CpuIcon, HashIcon } from 'lucide-react';
import type { ComponentProps } from 'react';
import { MessageMetadata as MessageMetadataType } from '@/interface/message.interface';

export type MessageMetadataProps = ComponentProps<'div'> & {
  metadata?: MessageMetadataType;
  showModel?: boolean;
  showTokens?: boolean;
  showTimestamp?: boolean;
};

export const MessageMetadata = ({
  className,
  metadata,
  showModel = true,
  showTokens = true,
  showTimestamp = false,
  ...props
}: MessageMetadataProps) => {
  if (!metadata) return null;

  // Check what data we have - only show if we have meaningful data
  const hasModel = showModel && metadata.model && metadata.model.trim() !== '';
  const hasTokens = showTokens && metadata.totalTokens && metadata.totalTokens > 0;
  const hasTimestamp = showTimestamp && metadata.createdAt;
  const hasGenerationTime = metadata.createdAt;

  // Only show if we have at least one meaningful piece of data
  const shouldShow = hasModel || hasTokens || hasTimestamp || hasGenerationTime;


  const formatTokenCount = (tokens?: number) => {
    if (!tokens) return null;
    return tokens.toLocaleString();
  };

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return null;
    return new Date(timestamp).toLocaleTimeString();
  };

  if (!shouldShow) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-3 text-xs text-muted-foreground px-1',
        className
      )}
      {...props}
    >
      {hasModel && (
        <div className="flex items-center gap-1">
          <CpuIcon className="h-3 w-3" />
          <span className="font-medium">{metadata.model}</span>
        </div>
      )}

      {hasTokens && (
        <div className="flex items-center gap-1">
          <HashIcon className="h-3 w-3" />
          <span>{formatTokenCount(metadata.totalTokens)} tokens</span>
        </div>
      )}

      {hasTimestamp && (
        <div className="flex items-center gap-1">
          <ClockIcon className="h-3 w-3" />
          <span>{formatTimestamp(metadata.createdAt)}</span>
        </div>
      )}
    </div>
  );
};
