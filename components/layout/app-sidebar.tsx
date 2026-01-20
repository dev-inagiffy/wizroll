"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  UserGroupIcon,
  Link01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home01Icon,
  },
  {
    title: "Communities",
    href: "/communities",
    icon: UserGroupIcon,
  },
  {
    title: "Public Links",
    href: "/links",
    icon: Link01Icon,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings01Icon,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-3 py-2">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="WizRoll"
            width={28}
            height={28}
            className="rounded-md"
          />
          <span className="text-base font-semibold">WizRoll</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-2 py-2">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`)
                    }
                    className="h-8"
                  >
                    <Link href={item.href}>
                      <HugeiconsIcon icon={item.icon} strokeWidth={2} className="size-4" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t px-3 py-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Theme</span>
          <ModeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
