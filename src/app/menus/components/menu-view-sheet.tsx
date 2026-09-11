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
          <SheetDescription>Menu details.</SheetDescription>
        </SheetHeader>
        <div className="overflow-y-auto px-4 pb-4">
          <DetailRow label="ID">{menu.id}</DetailRow>
          <DetailRow label="Slug">
            <span className="font-mono text-xs">{menu.slug}</span>
          </DetailRow>
          <DetailRow label="Parent menu">
            {menu.parentName ?? <Empty />}
          </DetailRow>
          <DetailRow label="Level">{menu.level}</DetailRow>
          <DetailRow label="Icon">{menu.icon ?? <Empty />}</DetailRow>
          <DetailRow label="Route name">
            {menu.routeName ? (
              <span className="font-mono text-xs">{menu.routeName}</span>
            ) : (
              <Empty />
            )}
          </DetailRow>
          <DetailRow label="Route pattern">
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
              {menu.isActive ? "Active" : "Inactive"}
            </Badge>
          </DetailRow>
          <DetailRow label="Order">{menu.sortOrder}</DetailRow>
          <DetailRow label="Created">
            {format(menu.createdAt, "dd MMM yyyy, HH:mm")}
          </DetailRow>
          <DetailRow label="Updated">
            {format(menu.updatedAt, "dd MMM yyyy, HH:mm")}
          </DetailRow>
        </div>
      </SheetContent>
    </Sheet>
  )
}
