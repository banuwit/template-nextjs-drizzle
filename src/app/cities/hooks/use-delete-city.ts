"use client"

import * as React from "react"

import { toast } from "@/components/ui/toast"

import { deleteCity } from "../actions"

export function useDeleteCity(city: { id: string; name: string }) {
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [pending, startTransition] = React.useTransition()

  function confirmDelete() {
    startTransition(async () => {
      try {
        await deleteCity(city.id)
        setConfirmOpen(false)
        toast.add({
          type: "success",
          title: "Kota dihapus",
          description: `${city.name} sudah dihapus.`,
        })
      } catch {
        toast.add({
          type: "error",
          title: "Gagal menghapus kota",
          description: "Coba lagi sebentar lagi.",
        })
      }
    })
  }

  return { confirmOpen, setConfirmOpen, pending, confirmDelete }
}
