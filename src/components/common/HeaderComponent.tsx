"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NavActions } from "@/components/nav-actions";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
    SidebarTrigger
} from "@/components/ui/sidebar";
import { useGlobalContext } from "@/providers/context-provider";
import { useEffect } from "react";
import ModelSelection from "./ModelSelection";

export default function HeaderComponent({ title, description, model }: { title?: string, description?: string, model?: string }) {
    const { setState } = useGlobalContext();
    useEffect(() => {
        if (model) {
            setState((prev: any) => ({ ...prev, model }));
        }
    }, [model, setState]);
    return (
        <>
            <header className="sticky bottom-0 flex shrink-0 items-center gap-2 px-2 py-2  z-10">
                <div className="flex flex-1 items-center gap-2 px-1">
                    <SidebarTrigger className="cursor-pointer" />
                    <Separator
                        orientation="vertical"
                        className="cursor-pointer mr-2 data-[orientation=vertical]:h-4"
                    />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbPage className="line-clamp-1">
                                    {title ? <>
                                        <div className="flex flex-col">
                                            <div className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 truncate whitespace-nowrap overflow-hidden">
                                                {title}
                                            </div>
                                            {description &&
                                                <div className="text-xs text-neutral-500 dark:text-neutral-400 overflow-hidden whitespace-nowrap">
                                                    {description
                                                        ?.split(" ")
                                                        .slice(0, 5)
                                                        .join(" ")}
                                                    {description && description.split(" ").length > 15 ? "..." : ""}
                                                </div>
                                            }
                                        </div>
                                    </> : <ModelSelection model={model} description={description} />}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <div className="ml-auto px-3">
                    <NavActions />
                </div>
            </header>
        </>
    )
}
