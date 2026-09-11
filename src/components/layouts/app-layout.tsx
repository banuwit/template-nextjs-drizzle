import * as React from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { AppSidebarHeader } from "@/components/app-sidebar-header"
import {
  BreadcrumbProvider,
  type BreadcrumbEntry,
} from "@/components/heading"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { listNavMenu } from "@/lib/navigation"

export type { BreadcrumbEntry }

export async function AppLayout({
  breadcrumbs = [],
  children,
}: {
  breadcrumbs?: BreadcrumbEntry[]
  children: React.ReactNode
}) {
  const menus = await listNavMenu()

  return (
    <SidebarProvider>
      <AppSidebar menus={menus} />
      <SidebarInset>
        <BreadcrumbProvider breadcrumbs={breadcrumbs}>
          <AppSidebarHeader />
          {children}
        </BreadcrumbProvider>
      </SidebarInset>
    </SidebarProvider>
  )
}
