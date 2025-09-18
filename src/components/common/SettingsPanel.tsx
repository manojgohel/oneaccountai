"use client";

import { updateConversation } from "@/actions/conversation/conversation.action";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { useGlobalContext } from "@/providers/context-provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings as SettingsIcon } from "lucide-react";
import { useParams } from "next/navigation";
import * as React from "react";

export default function SettingsPanel() {
    const [name, setName] = React.useState("");
    const [systemPrompt, setSystemPrompt] = React.useState("");
    const [reduceToken, setReduceToken] = React.useState(false);
    const params = useParams();
    const { state } = useGlobalContext();

    React.useEffect(() => {
        if (state?.conversation) {
            setName(state.conversation.name || "");
            setSystemPrompt(state.conversation.systemPrompt || "");
            setReduceToken(state.conversation.reduceToken || false);
        }
    }, [state?.conversation]);

    const queryClient = useQueryClient();

    const { mutate: updateConversationModel } = useMutation({
        mutationFn: ({ conversationId, name, systemPrompt, reduceToken }: { conversationId: string; name: string; systemPrompt: string; reduceToken: boolean }) =>
            updateConversation(conversationId, { name, systemPrompt, reduceToken }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            // Handle success (e.g., show a notification)
            console.log('Conversation updated successfully');
        },
        onError: (error) => {
            // Handle error (e.g., show an error message)
            console.error('Error updating conversation:', error);
        },
    });

    const handleUpdateConversation = () => {
        // Logic to update conversation settings goes here
        // For example, you might want to call an API to save these settings
        updateConversationModel({ conversationId: params?.conversationId as string, name, systemPrompt, reduceToken });
    }

    return (
        <Drawer>
            <DrawerTrigger asChild>
                <Button
                    variant="ghost"
                    className="p-2 rounded-md cursor-pointer"
                    aria-label="Open settings"
                >
                    <SettingsIcon size={16} />
                </Button>
            </DrawerTrigger>
            <DrawerContent className="bg-sidebar">
                <div className="mx-auto w-full max-w-md">
                    <DrawerHeader>
                        <DrawerTitle>Current Conversation Settings</DrawerTitle>
                        <DrawerDescription>Update your preferences below.</DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4 pb-0">
                        {/* Name Input */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your name"
                            />
                        </div>
                        {/* System Prompt Textarea */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                System Prompt
                            </label>
                            <textarea
                                value={systemPrompt}
                                onChange={(e) => setSystemPrompt(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                placeholder="Enter system prompt..."
                            />
                        </div>
                        {/* Reduce Input Token Checkbox */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="reduceToken"
                                checked={reduceToken}
                                onChange={(e) => setReduceToken(e.target.checked)}
                                className="mr-2"
                            />
                            <label htmlFor="reduceToken" className="text-sm text-gray-700">
                                Reduce Input Token
                            </label>
                        </div>
                    </div>
                    <DrawerFooter>
                        <DrawerClose asChild>
                            <Button onClick={handleUpdateConversation} variant="outline">Save</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}