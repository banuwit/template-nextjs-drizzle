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
          title: "Parameter deleted",
          description: `${parameter.code} has been deleted.`,
        })
      } catch {
        toast.add({
          type: "error",
          title: "Failed to delete parameter",
          description: parameter.isSystem
            ? "System parameters cannot be deleted."
            : "Please try again shortly.",
        })
      }
    })
  }

  return { confirmOpen, setConfirmOpen, pending, confirmDelete }
}
