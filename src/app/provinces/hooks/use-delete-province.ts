"use client"

import * as React from "react"

import { toast } from "@/components/ui/toast"

import { deleteProvince } from "../actions"

export function useDeleteProvince(province: { id: number; name: string }) {
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [pending, startTransition] = React.useTransition()

  function confirmDelete() {
    startTransition(async () => {
      try {
        await deleteProvince(province.id)
        setConfirmOpen(false)
        toast.add({
          type: "success",
          title: "Provinsi dihapus",
          description: `${province.name} sudah dihapus.`,
        })
      } catch {
        toast.add({
          type: "error",
          title: "Gagal menghapus provinsi",
          description: "Coba lagi sebentar lagi.",
        })
      }
    })
  }

  return { confirmOpen, setConfirmOpen, pending, confirmDelete }
}
