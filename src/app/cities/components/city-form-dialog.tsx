"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { City } from "@/db/schema"

import { createCity, updateCity } from "../actions"

import { CityForm } from "./city-form"

export function CityFormDialog({
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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Ubah kota" : "Kota baru"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Ubah data ${city.name}.`
              : "Tambahkan kota baru ke daftar."}
          </DialogDescription>
        </DialogHeader>
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
      </DialogContent>
    </Dialog>
  )
}
