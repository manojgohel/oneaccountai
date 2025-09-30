"use client";
import { getConversationMetaData } from "@/actions/conversation/conversation.action";
import { NavActions } from "@/components/nav-actions";
import { Separator } from "@/components/ui/separator";
import {
    SidebarTrigger
} from "@/components/ui/sidebar";
import { useGlobalContext } from "@/providers/context-provider";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import ModelSelection from "./ModelSelection";

interface HeaderComponentProps {
    readonly title?: string;
    readonly description?: string;
    readonly model?: string;
}

export default function HeaderComponent({ title, description, model }: HeaderComponentProps) {
    const { setState, state } = useGlobalContext();
    useEffect(() => {
        if (model) {
            setState((prev: any) => ({ ...prev, model }));
        }
    }, [model, setState]);



    const { data: conversationMetaData } = useQuery({
        queryKey: ["conversationMetaData"],
        queryFn: () => getConversationMetaData(state?.conversation?._id),
    });

    useEffect(() => {
        if (conversationMetaData?.status) {
            const convData = conversationMetaData;
            if (convData.name && convData.name !== title) {
                setState((prev: any) => ({ ...prev, conversation: { ...prev.conversation, name: convData.name } }));
            }
            if (convData.model && convData.model !== model) {
                setState((prev: any) => ({ ...prev, model: convData.model }));
            }
        }
    }, [conversationMetaData, title, model, setState]);

    return (
        <>
            <header className="sticky top-0 flex shrink-0 items-center gap-2 px-3 py-2 z-10 bg-secondary">
                <div className="flex flex-1 items-center gap-3 px-1 min-w-0 overflow-hidden">
                    <SidebarTrigger className="cursor-pointer flex-shrink-0 hover:bg-accent/80 transition-colors duration-200 rounded-lg p-1" />
                    <Separator
                        orientation="vertical"
                        className="cursor-pointer mr-1 data-[orientation=vertical]:h-6 flex-shrink-0 bg-border/60"
                    />
                    {title ?
                    <>
                        <div className="flex flex-col min-w-0 flex-shrink overflow-hidden" style={{ maxWidth: 'calc(100vw - 200px)' }}>
                            <div className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 truncate flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse"></div>
                                {title}
                            </div>
                            {description &&
                                <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate ml-4">
                                    {description
                                        ?.split(" ")
                                        .slice(0, 5)
                                        .join(" ")}
                                    {description && description.split(" ").length > 15 ? "..." : ""}
                                </div>
                            }
                        </div>
                    </> : <ModelSelection model={model} description={conversationMetaData?.name ?? description} />}
                </div>
                <div className="ml-auto px-2 flex-shrink-0">
                    <NavActions />
                </div>
            </header>
        </>
    )
}
