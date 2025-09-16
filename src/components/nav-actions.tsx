/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useQuery } from "@tanstack/react-query";
import {
  DollarSign,
  LogOut,
  User,
  User2,
  User2Icon
} from "lucide-react";
import * as React from "react";

import { getCurrentUser, logout } from "@/actions/auth/user.action";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useGlobalContext } from "@/providers/context-provider";
import { useRouter } from "next/navigation";
import { ModeToggleComponent } from "./common/ModeToggleComponent";

const data = [
  [
    {
      label: "Profile",
      icon: User2Icon,
      link: "/secure/profile"
    },
    {
      label: "Wallet or Uses Credits",
      icon: DollarSign,
      link: "/secure/wallet"
    },
  ],
  [
    {
      label: "Logout",
      icon: LogOut,
      link: "/secure/logout"
    },
  ],
]

export function NavActions() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { setState } = useGlobalContext();
  const router = useRouter();
  // React Query: get current user and set in global context
  const { data: userData, status } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    staleTime: 1000 * 60 * 5,
  });

  React.useEffect(() => {
    if (userData?.user) {
      setState((prev) => ({ ...prev, user: userData.user }));
    }
  }, [userData]);

  const handleClick = async (link: string) => {
    if (link === "/secure/logout") {
      // Handle logout logic here
      await logout();
      setState((prev) => ({ ...prev, user: null }));
      router.push("/auth");
      return;
    }
    router.push(link);
  }

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
              <SidebarGroup key={"username-1"} className="border-b last:border-none">
                <SidebarGroupContent className="gap-0">
                  <SidebarMenu>
                    <SidebarMenuItem key={"username-2"}>
                      <SidebarMenuButton className="cursor-pointer" >
                        <User /> <span>{status === "pending" ? "Loading..." : userData?.user?.name || userData?.user?.email}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {data && data.map((group, index) => (
                <SidebarGroup key={index} className="border-b last:border-none">
                  <SidebarGroupContent className="gap-0">
                    <SidebarMenu>
                      {group.map((item: any, index: number) => (
                        <SidebarMenuItem key={index}>
                          <SidebarMenuButton onClick={() => handleClick(item.link)} className="cursor-pointer" >
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
