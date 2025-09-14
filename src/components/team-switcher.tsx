"use client"


import {
  SidebarMenu,
  SidebarMenuItem
} from "@/components/ui/sidebar"
import Logo from "./common/Logo"

export function TeamSwitcher() {
  return (
    <SidebarMenu className="mb-2 mt-1">
      <SidebarMenuItem className="mb-1 mt-1 cursor-default">
        <Logo />
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
