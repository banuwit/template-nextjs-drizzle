"use client"

import { format } from "date-fns"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { Province } from "@/db/schema"

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b py-3 last:border-b-0 sm:flex-row sm:items-center sm:gap-4">
      <span className="w-24 shrink-0 text-xs text-muted-foreground">
        {label}
      </span>
      <span className="text-sm">{value}</span>
    </div>
  )
}

export function ProvinceViewSheet({
  province,
  onClose,
}: {
  province: Province
  onClose: () => void
}) {
  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="sm:max-w-md" showCloseButton>
        <SheetHeader>
          <SheetTitle>{province.name}</SheetTitle>
          <SheetDescription>Detail provinsi.</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-4">
          <DetailRow label="ID" value={String(province.id)} />
          <DetailRow label="Nama" value={province.name} />
          <DetailRow label="Kode" value={province.code} />
          <DetailRow
            label="Dibuat"
            value={format(province.createdAt, "dd MMM yyyy, HH:mm")}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
