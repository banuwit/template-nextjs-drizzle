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
          <DialogTitle>{isEdit ? "Edit Country" : "Add New Country"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Edit data for ${country.name}.`
              : "Add new country to the list."}
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
          submitLabel={isEdit ? "Save Changes" : "Add New Country"}
          successTitle={isEdit ? "Country Updated" : "Country Created"}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}
