"use client"

import * as React from "react"

import { toast } from "@/components/ui/toast"

import { deleteMenu } from "../actions"

export function useDeleteMenu(menu: { id: number; name: string }) {
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [pending, startTransition] = React.useTransition()

  function confirmDelete() {
    startTransition(async () => {
      try {
        await deleteMenu(menu.id)
        setConfirmOpen(false)
        toast.add({
          type: "success",
          title: "Menu dihapus",
          description: `${menu.name} beserta submenunya sudah dihapus.`,
        })
      } catch {
        toast.add({
          type: "error",
          title: "Gagal menghapus menu",
          description: "Coba lagi sebentar lagi.",
        })
      }
    })
  }

  return { confirmOpen, setConfirmOpen, pending, confirmDelete }
}
