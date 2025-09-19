"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
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

export default function HeaderComponent({ title, description, model }: { title?: string, description?: string, model?: string }) {
    const { setState, state } = useGlobalContext();
    useEffect(() => {
        if (model) {
            setState((prev: any) => ({ ...prev, model }));
        }
    }, [model, setState]);



    const { data: conversationMetaData, isLoading, error } = useQuery({
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
            <header className="sticky bottom-0 flex shrink-0 items-center gap-2 px-2 py-2 bg-secondary z-10">
                <div className="flex flex-1 items-center gap-2 px-1 min-w-0 overflow-hidden">
                    <SidebarTrigger className="cursor-pointer flex-shrink-0" />
                    <Separator
                        orientation="vertical"
                        className="cursor-pointer mr-2 data-[orientation=vertical]:h-4 flex-shrink-0"
                    />
                    {title ? <>
                        <div className="flex flex-col min-w-0 flex-shrink overflow-hidden" style={{ maxWidth: 'calc(100vw - 200px)' }}>
                            <div className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 truncate">
                                {title}
                            </div>
                            {description &&
                                <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
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
                <div className="ml-auto px-3 flex-shrink-0">
                    <NavActions />
                </div>
            </header>
        </>
    )
}
