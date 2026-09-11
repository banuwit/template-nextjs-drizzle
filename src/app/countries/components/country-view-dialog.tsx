"use client"

import { format } from "date-fns"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Country } from "@/db/schema"

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

export function CountryViewDialog({
  country,
  onClose,
}: {
  country: Country
  onClose: () => void
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>{country.name}</DialogTitle>
          <DialogDescription>Country details.</DialogDescription>
        </DialogHeader>
        <div>
          <DetailRow label="ID" value={String(country.id)} />
          <DetailRow label="Name" value={country.name} />
          <DetailRow label="Code" value={country.code} />
          <DetailRow
            label="Created"
            value={format(country.createdAt, "dd MMM yyyy, HH:mm")}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
