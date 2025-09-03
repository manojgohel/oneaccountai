"use client"


import {
  SidebarMenu,
  SidebarMenuItem
} from "@/components/ui/sidebar"
import Logo from "./common/Logo"

export function TeamSwitcher() {
  return (
    <SidebarMenu>
      <SidebarMenuItem className="mb-1 mt-1 cursor-default border-b-3 px-3 py-2">
        <Logo />
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
