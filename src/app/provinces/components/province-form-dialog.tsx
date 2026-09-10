"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Province } from "@/db/schema"

import { createProvince, updateProvince } from "../actions"

import { ProvinceForm } from "./province-form"

export function ProvinceFormDialog({
  mode,
  province,
  onClose,
}: {
  mode: "create" | "edit"
  province?: Province
  onClose: () => void
}) {
  const isEdit = mode === "edit" && province

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Ubah provinsi" : "Provinsi baru"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Ubah data ${province.name}.`
              : "Tambahkan provinsi baru ke daftar."}
          </DialogDescription>
        </DialogHeader>
        <ProvinceForm
          key={isEdit ? `edit-${province.id}` : "create"}
          action={
            isEdit ? updateProvince.bind(null, province.id) : createProvince
          }
          defaultValues={
            isEdit ? { name: province.name, code: province.code } : undefined
          }
          submitLabel={isEdit ? "Simpan perubahan" : "Buat provinsi"}
          successTitle={isEdit ? "Provinsi diubah" : "Provinsi dibuat"}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}
