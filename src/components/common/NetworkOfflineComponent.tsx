"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import useNetworkStatus from "@/hooks/use-network-status";
import { RefreshCw, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

const NetworkOfflineComponent = () => {
    const { isOnline } = useNetworkStatus();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleRetry = () => {
        if (typeof window !== 'undefined') {
            window.location.reload();
        }
    };



    return (
        <div className="w-full fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <Card className="w-full mx-4 text-center">
                <CardHeader className="pb-4">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                        <WifiOff className="h-8 w-8 text-destructive" />
                    </div>
                    <CardTitle className="text-xl font-semibold">
                        No Internet Connection
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Please check your network connection and try again.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                    <Button
                        onClick={handleRetry}
                        variant="outline"
                        className="w-full cursor-pointer"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default NetworkOfflineComponent;