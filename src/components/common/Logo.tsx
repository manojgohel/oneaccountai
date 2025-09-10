import { useTheme } from "next-themes";
import Image from "next/image";

export default function Logo() {
    const { theme } = useTheme();
    return (
        <div className="inline-flex items-center gap-2">
            <Image src="/images/logo.svg" alt="One Account AI" className={`h-5 w-5 ${theme === "light" ? "filter invert" : ""}`} width={100} height={24} />
            <span className="font-bold">One Account AI</span>
        </div>
    )
}