/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import SettingsPanel from '@/components/common/SettingsPanel';
import { Loader } from '@/components/loader';
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


export default function PromptInputComponent({
    handleSubmit,
    setInput,
    input,
    status,
    webSearch,
    setWebSearch,
    // file upload props
    onImageSelect,
    fileInputRef,
    isUploadingFile,
    selectedImages,
    removeImage,
    handleFileChange,
}: any) {
    return <>
        {/* File upload loading indicator */}
        {isUploadingFile && (
            <div className="mb-3 flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
                <Loader />
                <span className="text-xs text-blue-700 dark:text-blue-300">Uploading file...</span>
            </div>
        )}

        {/* Image preview section */}
        {selectedImages?.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2 p-2 bg-secondary/20 rounded">
                {selectedImages.map((file: string, index: number) => (
                    <div key={index} className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={`/api/file/${file}`}
                            alt={`Selected ${index + 1}`}
                            className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded border"
                        />
                        <button
                            onClick={() => removeImage(index)}
                            className="cursor-pointer absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs hover:bg-red-600"
                            aria-label="Remove image"
                            type="button"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        )}

        {/* Hidden file input (delegated to ChatComponent via ref/handler) */}
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            multiple
            className="hidden"
        />

        <PromptInput onSubmit={handleSubmit} className="w-full mx-auto">
            <PromptInputTextarea
                onChange={(e) => setInput(e.target.value)}
                value={input}
                placeholder="Type your message... (Ctrl/Cmd+Enter to send)"
            />
            <PromptInputToolbar>
                <PromptInputTools>
                    <PromptInputButton
                        variant="ghost"
                        onClick={onImageSelect}
                        disabled={isUploadingFile}
                        title="Attach image(s)"
                    >
                        <Paperclip size={16} />
                    </PromptInputButton>
                    <PromptInputButton
                        variant={webSearch ? 'default' : 'ghost'}
                        onClick={() => setWebSearch(!webSearch)}
                        title="Toggle web search"
                    >
                        <GlobeIcon size={16} />
                    </PromptInputButton>
                    <SettingsPanel />
                </PromptInputTools>
                <PromptInputSubmit
                    disabled={!input && (!selectedImages || selectedImages.length === 0)}
                    status={status}
                />
            </PromptInputToolbar>
        </PromptInput>
    </>
}