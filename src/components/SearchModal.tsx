"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, MessageSquare, FileText, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { searchConversationsAndMessages, SearchResult } from '@/actions/conversation/search';

interface SearchModalProps {
    readonly isOpen: boolean;
    readonly onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const router = useRouter();

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Search when debounced query changes
    useEffect(() => {
        const performSearch = async () => {
            if (debouncedQuery.trim().length < 2) {
                setResults([]);
                return;
            }

            setIsLoading(true);
            try {
                const response = await searchConversationsAndMessages(debouncedQuery);
                if (response.status) {
                    setResults(response.data || []);
                } else {
                    console.error('Search error:', response.error);
                    setResults([]);
                }
            } catch (error) {
                console.error('Search failed:', error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        };

        performSearch();
    }, [debouncedQuery]);

    const handleResultClick = useCallback((result: SearchResult) => {
        router.push(`/secure/${result.conversationId}`);
        onClose();
    }, [router, onClose]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    }, [onClose]);

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    };

    const getResultIcon = (type: 'conversation' | 'message') => {
        return type === 'conversation' ? <FileText className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Search Conversations & Messages
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 flex flex-col gap-4 min-h-0">
                    {/* Search Input */}
                    <div className="relative flex-shrink-0">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search conversations and messages..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="pl-10 pr-10"
                            autoFocus
                        />
                        {query && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                                onClick={() => setQuery('')}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {/* Search Results - Scrollable Container */}
                    <div className="flex-1 overflow-y-auto min-h-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8 px-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            </div>
                        ) : results.length > 0 ? (
                            <div className="space-y-2 pr-2">
                                {results.map((result) => (
                                    <button
                                        key={`${result.type}-${result._id}`}
                                        className="w-full p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors text-left"
                                        onClick={() => handleResultClick(result)}
                                        aria-label={`Open ${result.type}: ${result.title}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 mt-0.5">
                                                {getResultIcon(result.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-medium text-sm truncate">
                                                        {result.title}
                                                    </h4>
                                                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                                        {result.type}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                                    {result.content}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDate(result.updatedAt)}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : debouncedQuery.trim().length >= 2 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                                <Search className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">No results found</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Try different keywords or check your spelling
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                                <Search className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">
                                    Type at least 2 characters to search
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
