/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import SettingsPanel from '@/components/common/SettingsPanel';
import {
    PromptInput,
    PromptInputButton,
    PromptInputSubmit,
    PromptInputTextarea,
    PromptInputToolbar,
    PromptInputTools
} from '@/components/prompt-input';
import {
    GlobeIcon,
    Paperclip
} from 'lucide-react';


export default function PromptInputComponent({ handleSubmit, setInput, input, status, webSearch, setWebSearch }: any) {
    return <>
        <PromptInput onSubmit={handleSubmit} className="w-full mx-auto">
            <PromptInputTextarea
                onChange={(e) => setInput(e.target.value)}
                value={input}
            />
            <PromptInputToolbar>
                <PromptInputTools>
                    <PromptInputButton
                        variant={webSearch ? 'default' : 'ghost'}
                        onClick={() => setWebSearch(!webSearch)}
                    >
                        <Paperclip size={16} />
                    </PromptInputButton>
                    <PromptInputButton
                        variant={webSearch ? 'default' : 'ghost'}
                        onClick={() => setWebSearch(!webSearch)}
                    >
                        <GlobeIcon size={16} />
                    </PromptInputButton>
                    <SettingsPanel />
                </PromptInputTools>
                <PromptInputSubmit disabled={!input} status={status} />
            </PromptInputToolbar>
        </PromptInput>
    </>
}