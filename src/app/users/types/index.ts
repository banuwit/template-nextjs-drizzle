import type { NewUser } from "@/db/schema"

/**
 * Field yang bisa diisi user lewat form. Diturunkan dari tipe schema Drizzle
 * (`NewUser`), bukan ditulis tangan — lihat catatan di `src/db/schema/users.ts`:
 * satu sumber kebenaran, kolom yang berubah langsung ketahuan di typecheck.
 */
export type UserFormFields = Pick<NewUser, "name" | "email">

/** Pesan error per field; `form` untuk error yang bukan milik satu field. */
export type UserFormErrors = Partial<
  Record<keyof UserFormFields | "form", string[]>
>

/**
 * Nilai balik server action form. Bentuknya mengikuti `useActionState`:
 * action menerima state sebelumnya dan mengembalikan state baru.
 * Nama di-prefix fitur supaya tidak tabrakan saat fitur lain di-copy.
 */
export type UserActionState = {
  errors?: UserFormErrors
  /** Nilai terakhir yang dikirim, dipakai form untuk repopulate input saat gagal. */
  values?: UserFormFields
}

/** Query string halaman list user (`?q=&page=`) setelah dibersihkan. */
export type UserListParams = {
  q: string
  page: number
}
