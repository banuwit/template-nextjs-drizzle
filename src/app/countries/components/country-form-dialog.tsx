"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Country } from "@/db/schema"

import { createCountry, updateCountry } from "../actions"

import { CountryForm } from "./country-form"

export function CountryFormDialog({
  mode,
  country,
  onClose,
}: {
  mode: "create" | "edit"
  country?: Country
  onClose: () => void
}) {
  const isEdit = mode === "edit" && country

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Ubah negara" : "Negara baru"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Ubah data ${country.name}.`
              : "Tambahkan negara baru ke daftar."}
          </DialogDescription>
        </DialogHeader>
        <CountryForm
          key={isEdit ? `edit-${country.id}` : "create"}
          action={
            isEdit ? updateCountry.bind(null, country.id) : createCountry
          }
          defaultValues={
            isEdit ? { name: country.name, code: country.code } : undefined
          }
          submitLabel={isEdit ? "Simpan perubahan" : "Buat negara"}
          successTitle={isEdit ? "Negara diubah" : "Negara dibuat"}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}
