"use client"

import {
  Edit2,
  MessageCircle,
  MoreHorizontal,
  Trash2
} from "lucide-react"

import { deleteConversation } from "@/actions/conversation/conversation.action"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"

export function NavFavorites({
  favorites,
}: {
  favorites: {
    _id: string
    name: string
  }[]
}) {
  const { isMobile } = useSidebar();

  const queryClient = useQueryClient();
  const { mutate: handleDeleteConversation, status: deleteStatus } = useMutation({
    mutationFn: (id: string) => deleteConversation(id),
    onSuccess: () => {
      // Optionally refetch or update local state here
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error) => {
      // Optionally handle error here
      console.error(error);
    },
  });


  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Chats</SidebarGroupLabel>
      <SidebarMenu>
        {favorites.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <Link href={`/secure/${item._id}`} title={item.name}>
                <span><MessageCircle size={16} /></span>
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover className="cursor-pointer">
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem className="cursor-pointer">
                  <Edit2 className=" text-muted-foreground" />
                  <span>Rename</span>
                </DropdownMenuItem>
                {/* <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <Share className=" text-muted-foreground" />
                  <span>Share</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <ArrowUpRight className="text-muted-foreground" />
                  <span>Archive</span>
                </DropdownMenuItem> */}
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled={deleteStatus === "pending"} onClick={() => handleDeleteConversation(item?._id)} className="cursor-pointer text-orange-700">
                  <Trash2 className=" text-orange-700" />
                  <span className="text-orange-700">Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <MoreHorizontal />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
