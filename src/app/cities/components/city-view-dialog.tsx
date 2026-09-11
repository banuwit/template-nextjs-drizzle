"use client"

import { format } from "date-fns"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { City } from "@/db/schema"

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

export function CityViewDialog({
  city,
  onClose,
}: {
  city: City
  onClose: () => void
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>{city.name}</DialogTitle>
          <DialogDescription>City details.</DialogDescription>
        </DialogHeader>
        <div>
          <DetailRow label="ID" value={String(city.id)} />
          <DetailRow label="Name" value={city.name} />
          <DetailRow label="Code" value={city.code} />
          <DetailRow
            label="Created"
            value={format(city.createdAt, "dd MMM yyyy, HH:mm")}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
