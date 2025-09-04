"use client";
import { useEffect, useState } from "react";

const useNetworkStatus = () => {
    const [isOnline, setOnline] = useState<boolean>(true);
    const [isClient, setIsClient] = useState<boolean>(false);

    const updateNetworkStatus = () => {
        if (typeof window !== 'undefined') {
            setOnline(window.navigator.onLine);
        }
    };

    // Set client flag and initial network status
    useEffect(() => {
        setIsClient(true);
        updateNetworkStatus();
    }, []);

    useEffect(() => {
        // Only run on client-side
        if (!isClient || typeof window === 'undefined') return;

        window.addEventListener("load", updateNetworkStatus);
        window.addEventListener("online", updateNetworkStatus);
        window.addEventListener("offline", updateNetworkStatus);

        return () => {
            window.removeEventListener("load", updateNetworkStatus);
            window.removeEventListener("online", updateNetworkStatus);
            window.removeEventListener("offline", updateNetworkStatus);
        };
    }, [isClient]);

    return { isOnline, isClient };
};

export default useNetworkStatus;