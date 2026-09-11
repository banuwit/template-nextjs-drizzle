"use client"

import * as React from "react"
import {
  Building2Icon,
  CircleIcon,
  DatabaseIcon,
  GalleryVerticalEndIcon,
  GlobeIcon,
  LayoutDashboardIcon,
  MapPinnedIcon,
  MenuIcon,
  SlidersHorizontalIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

import { NavMain, type NavMainItem } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { siteConfig } from "@/config/site"
import type { NavMenuNode } from "@/lib/navigation"

// Kolom `menus.icon` menyimpan nama ikon lucide-react. Tambahkan ikon di sini
// saat memakai nama baru; nama yang tidak dikenal jatuh ke CircleIcon.
const ICONS: Record<string, LucideIcon> = {
  Building2Icon,
  DatabaseIcon,
  GlobeIcon,
  LayoutDashboardIcon,
  MapPinnedIcon,
  MenuIcon,
  SlidersHorizontalIcon,
  UsersIcon,
}

function toNavItem(node: NavMenuNode): NavMainItem {
  return {
    title: node.name,
    url: node.url ?? "#",
    icon: node.icon ? (ICONS[node.icon] ?? CircleIcon) : undefined,
    items: node.children.map((child) => ({
      title: child.name,
      url: child.url ?? "#",
    })),
  }
}

export function AppSidebar({
  menus,
  ...props
}: React.ComponentProps<typeof Sidebar> & { menus: NavMenuNode[] }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="px-2 h-12">
        <div className="flex min-w-0 items-center gap-2 overflow-hidden">
          <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground [&_svg]:size-4">
            <GalleryVerticalEndIcon />
          </div>
          <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-medium">{siteConfig.name}</span>
            <span className="truncate text-xs">{siteConfig.tagline}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={menus.map(toNavItem)} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
