"use client"

import type { ReactNode } from "react"
import { format } from "date-fns"

import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

import type { MenuListRow } from "../types"

function DetailRow({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-0.5 border-b py-3 last:border-b-0 sm:flex-row sm:gap-4">
      <span className="w-28 shrink-0 pt-0.5 text-xs text-muted-foreground">
        {label}
      </span>
      <div className="min-w-0 text-sm">{children}</div>
    </div>
  )
}

function Empty() {
  return <span className="text-muted-foreground">—</span>
}

export function MenuViewSheet({
  menu,
  onClose,
}: {
  menu: MenuListRow
  onClose: () => void
}) {
  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="sm:max-w-md" showCloseButton>
        <SheetHeader>
          <SheetTitle>{menu.name}</SheetTitle>
          <SheetDescription>Detail menu.</SheetDescription>
        </SheetHeader>
        <div className="overflow-y-auto px-4 pb-4">
          <DetailRow label="ID">{menu.id}</DetailRow>
          <DetailRow label="Slug">
            <span className="font-mono text-xs">{menu.slug}</span>
          </DetailRow>
          <DetailRow label="Menu induk">
            {menu.parentName ?? <Empty />}
          </DetailRow>
          <DetailRow label="Level">{menu.level}</DetailRow>
          <DetailRow label="Ikon">{menu.icon ?? <Empty />}</DetailRow>
          <DetailRow label="Nama route">
            {menu.routeName ? (
              <span className="font-mono text-xs">{menu.routeName}</span>
            ) : (
              <Empty />
            )}
          </DetailRow>
          <DetailRow label="Pola route">
            {menu.routePattern ? (
              <span className="font-mono text-xs">{menu.routePattern}</span>
            ) : (
              <Empty />
            )}
          </DetailRow>
          <DetailRow label="Layout">
            <Badge variant="outline">{menu.layout}</Badge>
          </DetailRow>
          <DetailRow label="Status">
            <Badge variant={menu.isActive ? "default" : "secondary"}>
              {menu.isActive ? "Aktif" : "Nonaktif"}
            </Badge>
          </DetailRow>
          <DetailRow label="Urutan">{menu.sortOrder}</DetailRow>
          <DetailRow label="Dibuat">
            {format(menu.createdAt, "dd MMM yyyy, HH:mm")}
          </DetailRow>
          <DetailRow label="Diubah">
            {format(menu.updatedAt, "dd MMM yyyy, HH:mm")}
          </DetailRow>
        </div>
      </SheetContent>
    </Sheet>
  )
}
