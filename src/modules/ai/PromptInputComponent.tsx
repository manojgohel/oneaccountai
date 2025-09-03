/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {
    PromptInput,
    PromptInputButton,
    PromptInputModelSelect,
    PromptInputModelSelectContent,
    PromptInputModelSelectItem,
    PromptInputModelSelectTrigger,
    PromptInputModelSelectValue,
    PromptInputSubmit,
    PromptInputTextarea,
    PromptInputToolbar,
    PromptInputTools,
} from '@/components/prompt-input';
import {
    GlobeIcon
} from 'lucide-react';


export default function PromptInputComponent({ handleSubmit, setInput, input, setModel, model, models, status, webSearch, setWebSearch }: any) {
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
                        <GlobeIcon size={16} />
                        <span>Search</span>
                    </PromptInputButton>
                    <PromptInputModelSelect
                        onValueChange={(value) => {
                            setModel(value);
                        }}
                        value={model}
                    >
                        <PromptInputModelSelectTrigger>
                            <PromptInputModelSelectValue />
                        </PromptInputModelSelectTrigger>
                        <PromptInputModelSelectContent>
                            {models.map((model: any) => (
                                <PromptInputModelSelectItem key={model.id} value={model.id}>
                                    {model.name}
                                </PromptInputModelSelectItem>
                            ))}
                        </PromptInputModelSelectContent>
                    </PromptInputModelSelect>
                </PromptInputTools>
                <PromptInputSubmit disabled={!input} status={status} />
            </PromptInputToolbar>
        </PromptInput>
    </>
}