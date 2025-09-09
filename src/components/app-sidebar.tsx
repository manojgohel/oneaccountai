"use client"

import {
  BugIcon,
  Command,
  Search,
  Settings,
  Sparkles
} from "lucide-react"
import * as React from "react"

import { getConversations } from "@/actions/conversation/conversation.action"
import { NavFavorites } from "@/components/nav-favorites"
import { NavMain } from "@/components/nav-main"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useQuery } from "@tanstack/react-query"

// This is sample data.
const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: Command,
      plan: "Enterprise",
    }
  ],
  navMain: [
    {
      title: "New Chat",
      url: "/secure/new",
      icon: Sparkles,
    },
    {
      title: "Search",
      url: "#",
      icon: Search,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
      isActive: true,
    },
    {
      title: "Developers",
      url: "#",
      icon: BugIcon,
      badge: "10",
    },
  ],
  conversations: []
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { status, data: conversations } = useQuery({ queryKey: ['conversations'], queryFn: () => getConversations() });

  return (
    <>
      <Sidebar className="border-r-0" {...props}>
        <SidebarHeader>
          <TeamSwitcher />
          <NavMain items={data.navMain} />
        </SidebarHeader>
        <SidebarContent>
          {status === 'pending' && <div className="p-4 text-sm text-gray-500">Loading...</div>}
          <NavFavorites favorites={conversations?.conversations || []} />
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    </>

  )
}
