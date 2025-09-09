"use client"

import {
  Bell,
  DollarSign,
  GalleryVerticalEnd,
  LineChart,
  LogOut,
  User2,
  User2Icon
} from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ModeToggleComponent } from "./common/ModeToggleComponent"

const data = [
  [
    {
      label: "User",
      icon: User2Icon,
    },
    {
      label: "Upgrade to Pro",
      icon: DollarSign,
    },
  ],
  [
    {
      label: "View analytics",
      icon: LineChart,
    },
    {
      label: "History",
      icon: GalleryVerticalEnd,
    },
    {
      label: "Notifications",
      icon: Bell,
    },
  ],
  [
    {
      label: "Logout",
      icon: LogOut,
    },
  ],
]

export function NavActions() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="flex items-center gap-2 text-sm">
      <ModeToggleComponent />
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer data-[state=open]:bg-accent h-7 w-7"
          >
            <User2 className="cursor-pointer" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-56 overflow-hidden rounded-lg p-0"
          align="end"
        >
          <Sidebar collapsible="none" className="bg-transparent">
            <SidebarContent>
              {data.map((group, index) => (
                <SidebarGroup key={index} className="border-b last:border-none">
                  <SidebarGroupContent className="gap-0">
                    <SidebarMenu>
                      {group.map((item, index) => (
                        <SidebarMenuItem key={index}>
                          <SidebarMenuButton className="cursor-pointer" >
                            <item.icon /> <span>{item.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}
            </SidebarContent>
          </Sidebar>
        </PopoverContent>
      </Popover>
    </div>
  )
}
