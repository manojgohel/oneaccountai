import { Bubbles } from "lucide-react";

export default function Logo() {
    return (
        <div className="inline-flex items-center gap-2">
            <Bubbles className="h-5 w-5" />
            <span className="font-bold">One Account AI</span>
        </div>
    )
}