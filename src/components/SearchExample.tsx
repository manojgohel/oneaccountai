"use client";

import { useState } from 'react';
import { Search, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchModal from './SearchModal';

/**
 * Example component showing how to integrate SearchModal
 *
 * Features:
 * - Keyboard shortcut (Cmd/Ctrl + K) to open search
 * - Search button integration
 * - Proper state management
 */
export default function SearchExample() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Handle keyboard shortcut
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            setIsSearchOpen(true);
        }
    };

    // Add keyboard listener
    useState(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    });

    return (
        <div className="flex items-center gap-2">
            {/* Search Button */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2"
            >
                <Search className="h-4 w-4" />
                Search
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <Command className="h-3 w-3" />
                    K
                </kbd>
            </Button>

            {/* Search Modal */}
            <SearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
            />
        </div>
    );
}

/**
 * USAGE INSTRUCTIONS:
 *
 * 1. Import SearchModal in your component:
 *    import SearchModal from '@/components/SearchModal';
 *
 * 2. Add state for modal visibility:
 *    const [isSearchOpen, setIsSearchOpen] = useState(false);
 *
 * 3. Add SearchModal component:
 *    <SearchModal
 *        isOpen={isSearchOpen}
 *        onClose={() => setIsSearchOpen(false)}
 *    />
 *
 * 4. Add trigger button:
 *    <Button onClick={() => setIsSearchOpen(true)}>
 *        Search
 *    </Button>
 *
 * 5. Optional: Add keyboard shortcut (Cmd/Ctrl + K):
 *    useEffect(() => {
 *        const handleKeyDown = (e: KeyboardEvent) => {
 *            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
 *                e.preventDefault();
 *                setIsSearchOpen(true);
 *            }
 *        };
 *        document.addEventListener('keydown', handleKeyDown);
 *        return () => document.removeEventListener('keydown', handleKeyDown);
 *    }, []);
 */
