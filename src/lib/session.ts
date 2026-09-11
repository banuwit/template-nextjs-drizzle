import "server-only"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"

import { auth } from "@/lib/auth"

/**
 * Data Access Layer untuk sesi. Pengecekan auth yang sesungguhnya ada di sini
 * (query DB), bukan di `src/proxy.ts` — proxy hanya melihat keberadaan cookie.
 *
 * `cache()` membuat header, halaman, dan query dalam satu render berbagi satu
 * lookup sesi.
 */
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() })
})

/** Data user yang aman dikirim ke client (tanpa field internal Better Auth). */
export type CurrentUser = {
  /** uuid user — dipakai untuk kolom audit (`createdBy`, dst.). */
  id: string
  name: string
  email: string
  image: string | null
}

/**
 * Wajib dipanggil di awal setiap fungsi `queries.ts` dan server action di
 * `actions.ts`. Tanpa sesi valid → redirect ke halaman login.
 */
export async function requireUser(): Promise<CurrentUser> {
  const session = await getSession()

  // Sesi user yang sudah di-soft-delete dianggap tidak ada (deleteUser juga
  // menghapus sesinya; ini jaring pengaman).
  if (!session || session.user.deletedAt) {
    redirect("/")
  }

  const { id, name, email, image } = session.user

  return { id, name, email, image: image ?? null }
}
