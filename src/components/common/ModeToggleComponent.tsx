"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ModeToggleComponent() {
    const { setTheme, theme } = useTheme()

    return (
        <Button className="cursor-pointer" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} variant="ghost" size="icon">
            {
                theme === "dark" ?
                    <Sun className="cursor-pointer" />
                    :
                    <Moon className="cursor-pointer" />
            }
        </Button>
    )
}
