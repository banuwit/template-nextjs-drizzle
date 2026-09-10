"use client"

import * as React from "react"
import {
  AudioLinesIcon,
  GalleryVerticalEndIcon,
  MapIcon,
  TerminalIcon,
  MenuIcon,
  SlidersHorizontalIcon,
  UsersIcon,
  HomeIcon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    { name: "Acme Inc", logo: GalleryVerticalEndIcon, plan: "Enterprise" },
    { name: "Acme Corp.", logo: AudioLinesIcon, plan: "Startup" },
    { name: "Evil Corp.", logo: TerminalIcon, plan: "Free" },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "#",
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
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
