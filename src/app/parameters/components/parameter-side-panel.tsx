"use client"

import type { ComponentProps, ReactNode } from "react"
import { XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const PARAMETER_SIDE_PANEL_TITLE_ID = "parameter-side-panel-title"

/**
 * Panel inline, bukan Sheet: body list menyusut ke kiri saat panel terbuka dan
 * klik di luar panel TIDAK menutupnya — hanya tombol X atau Batal. Jangan
 * ganti dengan `src/components/ui/sheet.tsx`.
 */
export function ParameterSidePanelLayout({
  children,
  panel,
  open,
}: {
  children: ReactNode
  panel: ReactNode
  open: boolean
}) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1">
      <div className="min-w-0 flex-1">{children}</div>
      <div
        className={cn(
          // Halaman ini scroll sebagai satu dokumen (lihat `AppSidebarHeader`
          // yang `sticky top-0`) — tidak ada leluhur dengan tinggi terikat,
          // jadi `h-full` biasa tidak pernah membatasi apa pun. `sticky` +
          // tinggi dalam satuan `svh` (relatif viewport, bukan leluhur)
          // membuat kolom ini berperilaku seperti Sheet: menempel di bawah
          // header aplikasi sambil membawa tinggi tetap, supaya body di
          // dalamnya (lihat `ParameterSidePanelBody`) benar-benar punya
          // batas untuk di-`overflow-auto`-kan. Angka `top-12`/`3rem` HARUS
          // sama dengan `h-12` di `app-sidebar-header.tsx` — kalau tinggi
          // header itu berubah, ubah juga di sini (selisihnya nongol sebagai
          // gap antara header dan panel).
          "sticky top-12 flex h-[calc(100svh-3rem)] shrink-0 flex-col overflow-hidden bg-background transition-[width] duration-200 ease-in-out",
          open ? "w-[28rem] max-w-full border-l" : "w-0",
        )}
        aria-hidden={!open}
      >
        <aside
          className="flex h-full w-[28rem] max-w-full flex-col"
          role="region"
          aria-labelledby={PARAMETER_SIDE_PANEL_TITLE_ID}
        >
          {panel}
        </aside>
      </div>
    </div>
  )
}

/**
 * `actions` menggantikan tombol X bawaan — dipakai form create/edit supaya
 * submit/batal ada di header, bukan footer terpisah. View panel (tanpa
 * `actions`) tetap dapat tombol X seperti biasa.
 */
export function ParameterSidePanelHeader({
  children,
  onClose,
  actions,
}: {
  children: ReactNode
  onClose: () => void
  actions?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b px-4 py-4">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">{children}</div>
      <div className="flex shrink-0 items-center gap-2">
        {actions ?? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </Button>
        )}
      </div>
    </div>
  )
}

export function ParameterSidePanelTitle({
  className,
  ...props
}: ComponentProps<"h2">) {
  return (
    <h2
      id={PARAMETER_SIDE_PANEL_TITLE_ID}
      className={cn(
        "font-heading text-sm font-medium text-foreground",
        className,
      )}
      {...props}
    />
  )
}

export function ParameterSidePanelDescription({
  className,
  ...props
}: ComponentProps<"p">) {
  return (
    <p
      className={cn("text-xs/relaxed text-muted-foreground", className)}
      {...props}
    />
  )
}

export function ParameterSidePanelBody({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn("min-h-0 flex-1 overflow-auto p-4", className)}
      {...props}
    />
  )
}
