"use client"

import {
  Edit2,
  MoreHorizontal,
  Trash2
} from "lucide-react";
import { useState } from "react";

import { deleteConversation, updateConversation } from "@/actions/conversation/conversation.action";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

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
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  // State for renaming
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>("");

  const { mutate: handleRenameConversation, status: renameStatus } = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateConversation(id, { name }),
    onSuccess: () => {
      setRenamingId(null);
      setRenameValue("");
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const handleRenameClick = (item: { _id: string; name: string }) => {
    setRenamingId(item._id);
    setRenameValue(item.name);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: string) => {
    if (e.key === "Enter" && renameValue.trim()) {
      handleRenameConversation({ id, name: renameValue.trim() });
    } else if (e.key === "Escape") {
      setRenamingId(null);
      setRenameValue("");
    }
  };

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Chats</SidebarGroupLabel>
      <SidebarMenu>
        {favorites.map((item) => (
          <SidebarMenuItem key={item._id}>
            <SidebarMenuButton asChild>
              {renamingId === item._id ? (
                <input
                  className="px-2 py-1 rounded border w-full"
                  value={renameValue}
                  autoFocus
                  onChange={e => setRenameValue(e.target.value)}
                  onKeyDown={e => handleRenameKeyDown(e, item._id)}
                  onBlur={() => setRenamingId(null)}
                  disabled={renameStatus === "pending"}
                />
              ) : (
                <Link href={`/secure/${item._id}`} title={item.name}>
                  <span>{item.name}</span>
                </Link>
              )}
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
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => handleRenameClick(item)}
                  disabled={renameStatus === "pending"}
                >
                  <Edit2 className=" text-muted-foreground" />
                  <span>Rename</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={deleteStatus === "pending"}
                  onClick={() => handleDeleteConversation(item?._id)}
                  className="cursor-pointer text-orange-700"
                >
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
