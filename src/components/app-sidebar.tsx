"use client"

import * as React from "react"
import {
  GalleryVerticalEndIcon,
  MapIcon,
  MenuIcon,
  SlidersHorizontalIcon,
  UsersIcon,
  HomeIcon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  brand: {
    name: "Company Name",
    logo: GalleryVerticalEndIcon,
    plan: "Management System",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: HomeIcon,
    },
    {
      title: "Users",
      url: "/users",
      icon: UsersIcon,
    },
    {
      title: "Parameters",
      url: "/parameters",
      icon: SlidersHorizontalIcon,
    },
    {
      title: "Location",
      url: "#",
      icon: MapIcon,
      items: [
        { title: "Countries", url: "/countries" },
        { title: "Provinces", url: "/provinces" },
        { title: "Cities", url: "/cities" },
      ],
    },
    {
      title: "Menus",
      url: "/menus",
      icon: MenuIcon,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { name, logo: Logo, plan } = data.brand

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="px-2 h-12">
        <div className="flex min-w-0 items-center gap-2 overflow-hidden">
          <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground [&_svg]:size-4">
            <Logo />
          </div>
          <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-medium">{name}</span>
            <span className="truncate text-xs">{plan}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
