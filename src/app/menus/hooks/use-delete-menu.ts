"use client"

import * as React from "react"

import { toast } from "@/components/ui/toast"

import { deleteMenu } from "../actions"

export function useDeleteMenu(menu: { id: string; name: string }) {
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [pending, startTransition] = React.useTransition()

  function confirmDelete() {
    startTransition(async () => {
      try {
        await deleteMenu(menu.id)
        setConfirmOpen(false)
        toast.add({
          type: "success",
          title: "Menu deleted",
          description: `${menu.name} and its submenus has been deleted.`,
        })
      } catch {
        toast.add({
          type: "error",
          title: "Failed to delete menu",
          description: "Please try again shortly.",
        })
      }
    })
  }

  return { confirmOpen, setConfirmOpen, pending, confirmDelete }
}
