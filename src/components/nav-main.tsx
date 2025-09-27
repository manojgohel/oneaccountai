/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"


import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { DollarSign, Search, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import SearchModal from "./SearchModal";

export function NavMain() {
  const items: any = [
    {
      title: "New Chat",
      url: "/secure/new",
      icon: Sparkles,
      isActive: true,
    },
    {
      title: "Search",
      url: "/secure/search",
      icon: Search,
    },
    {
      title: "Token Usage",
      url: "/secure/wallet",
      icon: DollarSign,
    },
    // {
    //   title: "Developers",
    //   url: "#",
    //   icon: BugIcon,
    //   badge: "10",
    // },
  ];
  const route = useRouter();
  const handleOnClick = (url: string) => {
    if (url === "/secure/search") {
      setIsSearchOpen(true);
      return;
    }
    route.push(url);
  }

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
    <SearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
            />
    <SidebarMenu>
      {items.map((item: any) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild isActive={item.isActive}>
            <span className="text-start cursor-pointer" onClick={() => handleOnClick(item.url)}>
              <item.icon />
              <span className="text-start">{item.title}</span>
            </span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
    </>
  )
}
