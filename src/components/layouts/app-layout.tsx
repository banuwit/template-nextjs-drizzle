import * as React from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { AppSidebarHeader } from "@/components/app-sidebar-header"
import {
  BreadcrumbProvider,
  type BreadcrumbEntry,
} from "@/components/heading"
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
        <BreadcrumbProvider breadcrumbs={breadcrumbs}>
          <AppSidebarHeader />
          {children}
        </BreadcrumbProvider>
      </SidebarInset>
    </SidebarProvider>
  )
}
