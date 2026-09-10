"use client"

import { useState } from "react"

import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toFieldErrors } from "@/lib/form"

const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

/**
 * Kolom warna disimpan sebagai teks hex (`varchar(10)`) dan boleh kosong,
 * sedangkan `<input type="color">` tidak punya state "kosong" — ia selalu
 * mengembalikan sebuah warna. Jadi input teks yang memegang `name`, dan color
 * picker hanya alat bantu yang menulis ke state yang sama.
 */
export function ParameterColorField({
  id,
  name,
  label,
  defaultValue,
  fallback,
  errors,
}: {
  id: string
  name: string
  label: string
  defaultValue?: string | null
  fallback: string
  errors?: string[]
}) {
  const [value, setValue] = useState(defaultValue ?? "")

  return (
    <Field data-invalid={errors ? true : undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          name={name}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={fallback}
          autoComplete="off"
          maxLength={10}
          aria-invalid={errors ? true : undefined}
          className="flex-1"
        />
        <input
          type="color"
          aria-label={`Pilih ${label.toLowerCase()}`}
          value={HEX.test(value) ? value : fallback}
          onChange={(event) => setValue(event.target.value)}
          className="size-9 shrink-0 cursor-pointer rounded-md border bg-background p-1"
        />
      </div>
      <FieldError errors={toFieldErrors(errors)} />
    </Field>
  )
}
