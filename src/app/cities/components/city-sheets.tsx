"use client"

import type { ReactNode } from "react"
import { format } from "date-fns"

import type { City } from "@/db/schema"

import { createCity, updateCity } from "../actions"

import { CityForm } from "./city-form"
import {
  CitySidePanelBody,
  CitySidePanelDescription,
  CitySidePanelHeader,
  CitySidePanelLayout,
  CitySidePanelTitle,
} from "./city-side-panel"

export type CitySheet =
  | { type: "closed" }
  | { type: "create" }
  | { type: "view"; city: City }
  | { type: "edit"; city: City }

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

function CityFormPanel({
  mode,
  city,
  onClose,
}: {
  mode: "create" | "edit"
  city?: City
  onClose: () => void
}) {
  const isEdit = mode === "edit" && city

  return (
    <>
      <CitySidePanelHeader onClose={onClose}>
        <CitySidePanelTitle>
          {isEdit ? "Ubah kota" : "Kota baru"}
        </CitySidePanelTitle>
        <CitySidePanelDescription>
          {isEdit
            ? `Ubah data ${city.name}.`
            : "Tambahkan kota baru ke daftar."}
        </CitySidePanelDescription>
      </CitySidePanelHeader>
      <CityForm
        key={isEdit ? `edit-${city.id}` : "create"}
        action={isEdit ? updateCity.bind(null, city.id) : createCity}
        defaultValues={
          isEdit ? { name: city.name, code: city.code } : undefined
        }
        submitLabel={isEdit ? "Simpan perubahan" : "Buat kota"}
        successTitle={isEdit ? "Kota diubah" : "Kota dibuat"}
        onClose={onClose}
      />
    </>
  )
}

function CityViewPanel({
  city,
  onClose,
}: {
  city: City
  onClose: () => void
}) {
  return (
    <>
      <CitySidePanelHeader onClose={onClose}>
        <CitySidePanelTitle>{city.name}</CitySidePanelTitle>
        <CitySidePanelDescription>Detail kota.</CitySidePanelDescription>
      </CitySidePanelHeader>
      <CitySidePanelBody>
        <DetailRow label="ID" value={String(city.id)} />
        <DetailRow label="Nama" value={city.name} />
        <DetailRow label="Kode" value={city.code} />
        <DetailRow
          label="Dibuat"
          value={format(city.createdAt, "dd MMM yyyy, HH:mm")}
        />
      </CitySidePanelBody>
    </>
  )
}

export function CitySheets({
  sheet,
  onSheetChange,
  children,
}: {
  sheet: CitySheet
  onSheetChange: (next: CitySheet) => void
  children: ReactNode
}) {
  function close() {
    onSheetChange({ type: "closed" })
  }

  const panel =
    sheet.type === "create" ? (
      <CityFormPanel mode="create" onClose={close} />
    ) : sheet.type === "edit" ? (
      <CityFormPanel mode="edit" city={sheet.city} onClose={close} />
    ) : sheet.type === "view" ? (
      <CityViewPanel city={sheet.city} onClose={close} />
    ) : null

  return (
    <CitySidePanelLayout open={sheet.type !== "closed"} panel={panel}>
      {children}
    </CitySidePanelLayout>
  )
}
