"use client"

import { useQuery } from "@tanstack/react-query";
import {
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
    // {
    //   label: "Wallet or Uses Credits",
    //   icon: DollarSign,
    //   link: "/secure/wallet"
    // },
  ],
  [
    {
      label: "Logout",
      icon: LogOut,
      link: "/logout"
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
  }, [userData, setState]);

  const handleClick = async (link: string) => {
    if (link === "/logout") {
      // Handle logout logic here
      await logout();
      setState((prev) => ({ ...prev, user: null }));
      router.push("/auth");
      return;
    }
    router.push(link);
  }

  return (
    <div className="flex items-center">
      <ModeToggleComponent />
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <User2 className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-48 p-1 shadow-md border bg-white dark:bg-slate-900"
          align="end"
        >
          <div className="space-y-1">
            {/* User Info */}
            <div className="px-3 py-2 border-b">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {status === "pending" ? "Loading..." : userData?.user?.name || userData?.user?.email}
                </span>
              </div>
            </div>

            {/* Menu Items */}
            {data?.map((group, groupIndex) => (
              <div key={`group-${groupIndex}`} className="space-y-1">
                {group.map((item: any, itemIndex: number) => (
                  <button
                    key={`item-${groupIndex}-${itemIndex} `}
                    onClick={() => handleClick(item.link)}
                    className="w-full flex items-center cursor-pointer gap-2 px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                  >
                    <item.icon className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
