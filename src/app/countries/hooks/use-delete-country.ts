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
          title: "Negara dihapus",
          description: `${country.name} sudah dihapus.`,
        })
      } catch {
        toast.add({
          type: "error",
          title: "Gagal menghapus negara",
          description: "Coba lagi sebentar lagi.",
        })
      }
    })
  }

  return { confirmOpen, setConfirmOpen, pending, confirmDelete }
}
