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

/**
 * Kolom yang boleh dipakai untuk sort list user. Satu-satunya sumber
 * kebenaran: `parseUserListParams` mem-whitelist query string terhadap array
 * ini, dan `queries.ts` mengetik map kolomnya sebagai `Record<UserSortColumn, ...>`
 * supaya kolom yang lupa ditambah ke map langsung ketahuan di typecheck.
 */
export const USER_SORT_COLUMNS = ["name", "email", "created_at"] as const

export type UserSortColumn = (typeof USER_SORT_COLUMNS)[number]

/** Query string halaman list user setelah dibersihkan dan di-whitelist. */
export type UserListParams = {
  search: string
  page: number
  sort: UserSortColumn
  direction: "asc" | "desc"
  perPage: number
}
