"use client"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { Province } from "@/db/schema"

import { createProvince, updateProvince } from "../actions"

import { ProvinceForm } from "./province-form"

export function ProvinceFormSheet({
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
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="sm:max-w-md" showCloseButton>
        <SheetHeader>
          <SheetTitle>{isEdit ? "Ubah provinsi" : "Provinsi baru"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? `Ubah data ${province.name}.`
              : "Tambahkan provinsi baru ke daftar."}
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-4">
          <ProvinceForm
            key={isEdit ? `edit-${province.id}` : "create"}
            action={
              isEdit ? updateProvince.bind(null, province.id) : createProvince
            }
            defaultValues={
              isEdit
                ? { name: province.name, code: province.code }
                : undefined
            }
            submitLabel={isEdit ? "Simpan perubahan" : "Buat provinsi"}
            successTitle={isEdit ? "Provinsi diubah" : "Provinsi dibuat"}
            onClose={onClose}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
