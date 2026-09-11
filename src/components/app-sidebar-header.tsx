import { NavUser } from "@/components/nav-user"
import { NotificationBell } from "@/components/notification-bell"
import { ThemeToggle } from "@/components/theme-toggle"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { requireUser } from "@/lib/session"

export async function AppSidebarHeader() {
  // Satu lookup sesi per render (getSession di-cache) — dipakai bersama queries.
  const user = await requireUser()

  return (
    <header className="sticky top-0 bg-sidebar z-10 flex h-12 shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex flex-1 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
      </div>
      <div className="flex items-center gap-2 px-4">
        <ThemeToggle />
        <NotificationBell />
        <NavUser user={user} />
      </div>
    </header>
  )
}
