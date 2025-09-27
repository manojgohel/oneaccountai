"use client";

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchModal from './SearchModal';

export default function SearchButton() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2"
            >
                <Search className="h-4 w-4" />
                Search
            </Button>

            <SearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
            />
        </>
    );
}
