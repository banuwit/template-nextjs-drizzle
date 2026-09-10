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
    <div className="flex min-h-0 flex-1">
      <div className="min-w-0 flex-1">{children}</div>
      <div
        className={cn(
          "flex min-h-0 shrink-0 flex-col overflow-hidden bg-background transition-[width] duration-200 ease-in-out",
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

export function ParameterSidePanelHeader({
  children,
  onClose,
}: {
  children: ReactNode
  onClose: () => void
}) {
  return (
    <div className="relative flex flex-col gap-0.5 border-b px-4 py-4 pr-12">
      {children}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute top-3 right-3"
        onClick={onClose}
      >
        <XIcon />
        <span className="sr-only">Tutup</span>
      </Button>
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

export function ParameterSidePanelFooter({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn("mt-auto flex items-center gap-2 border-t p-4", className)}
      {...props}
    />
  )
}
