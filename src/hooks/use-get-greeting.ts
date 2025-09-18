import { useEffect, useState } from "react";

function getGreeting(hour: number): string {
    if (hour >= 5 && hour < 12) {
        return "Good morning";
    } else if (hour >= 12 && hour < 17) {
        return "Good afternoon";
    } else if (hour >= 17 && hour < 21) {
        return "Good evening";
    } else {
        return "Hello";
    }
}

export function useGreeting(): string {
    const [greeting, setGreeting] = useState<string>("");

    useEffect(() => {
        const date = new Date();
        const hour = date.getHours();
        setGreeting(getGreeting(hour));
    }, []);

    return greeting;
}
