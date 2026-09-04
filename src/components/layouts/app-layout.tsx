import * as React from "react"

import { AppSidebar } from "@/components/app-sidebar"
import {
  AppSidebarHeader,
  type BreadcrumbEntry,
} from "@/components/app-sidebar-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export type { BreadcrumbEntry }

export function AppLayout({
  breadcrumbs = [],
  children,
}: {
  breadcrumbs?: BreadcrumbEntry[]
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppSidebarHeader breadcrumbs={breadcrumbs} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
