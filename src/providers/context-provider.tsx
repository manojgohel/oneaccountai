/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { createContext, useContext, useState, type ReactNode } from "react";

type GlobalState = {
    // Add your global state properties here
    user?: { name: string; email: string; model: string } | null;
    theme?: "light" | "dark";
    model?: string | null;
    conversation?: any; // Define a proper type based on your conversation structure
    // ...add more as needed
};

type GlobalContextType = {
    state: GlobalState;
    setState: React.Dispatch<React.SetStateAction<GlobalState>>;
};

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<GlobalState>({});

    return (
        <GlobalContext.Provider value={{ state, setState }}>
            {children}
        </GlobalContext.Provider>
    );
}

// Custom hook for easy access
export function useGlobalContext() {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error("useGlobalContext must be used within a GlobalProvider");
    }
    return context;
}