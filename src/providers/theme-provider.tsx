"use client"

import NetworkOfflineComponent from "@/components/common/NetworkOfflineComponent";
import useNetworkStatus from "@/hooks/use-network-status";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";

export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    const { isOnline } = useNetworkStatus();

    return <NextThemesProvider {...props}>
        {isOnline ? children : <NetworkOfflineComponent />}
    </NextThemesProvider>
}