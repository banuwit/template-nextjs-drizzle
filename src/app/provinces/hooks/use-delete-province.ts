"use client"

import * as React from "react"

import { toast } from "@/components/ui/toast"

import { deleteProvince } from "../actions"

export function useDeleteProvince(province: { id: string; name: string }) {
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [pending, startTransition] = React.useTransition()

  function confirmDelete() {
    startTransition(async () => {
      try {
        await deleteProvince(province.id)
        setConfirmOpen(false)
        toast.add({
          type: "success",
          title: "Province deleted",
          description: `${province.name} has been deleted.`,
        })
      } catch {
        toast.add({
          type: "error",
          title: "Failed to delete province",
          description: "Please try again shortly.",
        })
      }
    })
  }

  return { confirmOpen, setConfirmOpen, pending, confirmDelete }
}
