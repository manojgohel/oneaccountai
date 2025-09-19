"use client"

import * as React from "react"

import { NavFavorites } from "@/components/nav-favorites"
import { NavMain } from "@/components/nav-main"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  return (
    <>
      <Sidebar className="border-r-0" {...props}>
        <SidebarHeader>
          <TeamSwitcher />
          <NavMain />
        </SidebarHeader>
        <SidebarContent>
          <NavFavorites />
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    </>

  )
}
