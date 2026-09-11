"use client"

import * as React from "react"

import { toast } from "@/components/ui/toast"

import { deleteCountry } from "../actions"

export function useDeleteCountry(country: { id: string; name: string }) {
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [pending, startTransition] = React.useTransition()

  function confirmDelete() {
    startTransition(async () => {
      try {
        await deleteCountry(country.id)
        setConfirmOpen(false)
        toast.add({
          type: "success",
          title: "Country deleted",
          description: `${country.name} has been deleted.`,
        })
      } catch {
        toast.add({
          type: "error",
          title: "Failed to delete country",
          description: "Please try again shortly.",
        })
      }
    })
  }

  return { confirmOpen, setConfirmOpen, pending, confirmDelete }
}
