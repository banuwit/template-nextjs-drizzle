"use client"

import * as React from "react"

import { toast } from "@/components/ui/toast"

import { deleteUser } from "../actions"

/**
 * State untuk alur hapus user: buka/tutup dialog konfirmasi, status pending,
 * dan notifikasi hasil. Dipisah dari komponen supaya markup dialog tetap tipis
 * dan alur yang sama gampang dipakai ulang (mis. tombol hapus di halaman detail).
 */
export function useDeleteUser(user: { id: number; name: string }) {
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [pending, startTransition] = React.useTransition()

  function confirmDelete() {
    startTransition(async () => {
      try {
        await deleteUser(user.id)
        setConfirmOpen(false)
        toast.add({
          type: "success",
          title: "User dihapus",
          description: `${user.name} sudah dihapus.`,
        })
      } catch {
        toast.add({
          type: "error",
          title: "Gagal menghapus user",
          description: "Coba lagi sebentar lagi.",
        })
      }
    })
  }

  return { confirmOpen, setConfirmOpen, pending, confirmDelete }
}
