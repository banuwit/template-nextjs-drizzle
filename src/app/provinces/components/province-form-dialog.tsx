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
          <DialogTitle>{isEdit ? "Edit Province" : "Add New Province"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Edit data for ${province.name}.`
              : "Add new province to the list."}
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
          submitLabel={isEdit ? "Save Changes" : "Add New Province"}
          successTitle={isEdit ? "Province Updated" : "Province Created"}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}
