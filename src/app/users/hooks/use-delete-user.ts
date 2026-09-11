"use client"

import * as React from "react"

import { toast } from "@/components/ui/toast"

import { deleteUser } from "../actions"

/**
 * State untuk alur hapus user: buka/tutup dialog konfirmasi, status pending,
 * dan notifikasi hasil. Dipisah dari komponen supaya markup dialog tetap tipis
 * dan alur yang sama gampang dipakai ulang (mis. tombol hapus di halaman detail).
 */
export function useDeleteUser(user: { id: string; name: string }) {
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [pending, startTransition] = React.useTransition()

  function confirmDelete() {
    startTransition(async () => {
      try {
        await deleteUser(user.id)
        setConfirmOpen(false)
        toast.add({
          type: "success",
          title: "User deleted",
          description: `${user.name} has been deleted.`,
        })
      } catch {
        toast.add({
          type: "error",
          title: "Failed to delete user",
          description: "Please try again shortly.",
        })
      }
    })
  }

  return { confirmOpen, setConfirmOpen, pending, confirmDelete }
}
