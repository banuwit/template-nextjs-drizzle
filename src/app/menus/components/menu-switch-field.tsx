"use client"

import { useState } from "react"

import { FieldDescription } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"

/**
 * Switch/Checkbox yang tidak aktif TIDAK ikut terkirim di FormData, sehingga
 * "dimatikan" tidak bisa dibedakan dari "tidak dikirim". Pola aman di repo ini:
 * state lokal + hidden input yang selalu mengirim "1" / "0".
 */
export function MenuSwitchField({
  id,
  name,
  label,
  description,
  defaultChecked,
}: {
  id: string
  name: string
  label: string
  description: string
  defaultChecked: boolean
}) {
  const [checked, setChecked] = useState(defaultChecked)

  return (
    <div className="flex items-start justify-between gap-4 rounded-md border p-3">
      <div className="flex flex-col gap-0.5">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <FieldDescription>{description}</FieldDescription>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={setChecked}
        className="mt-1"
      />
      <input type="hidden" name={name} value={checked ? "1" : "0"} />
    </div>
  )
}
