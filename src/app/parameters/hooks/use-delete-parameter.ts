"use client"

import * as React from "react"

import { toast } from "@/components/ui/toast"

import { deleteParameter } from "../actions"

export function useDeleteParameter(parameter: {
  id: string
  code: string
  isSystem: boolean
}) {
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [pending, startTransition] = React.useTransition()

  function confirmDelete() {
    startTransition(async () => {
      try {
        await deleteParameter(parameter.id)
        setConfirmOpen(false)
        toast.add({
          type: "success",
          title: "Parameter dihapus",
          description: `${parameter.code} sudah dihapus.`,
        })
      } catch {
        toast.add({
          type: "error",
          title: "Gagal menghapus parameter",
          description: parameter.isSystem
            ? "Parameter sistem tidak bisa dihapus."
            : "Coba lagi sebentar lagi.",
        })
      }
    })
  }

  return { confirmOpen, setConfirmOpen, pending, confirmDelete }
}
