/**
 * Jembatan antara hasil validasi zod dan komponen form shadcn.
 *
 * Ditaruh di `src/lib/` karena semua form di proyek ini memakai pola yang sama:
 * server action mengembalikan `string[]` per field, `FieldError` meminta objek.
 */

/** Ubah daftar pesan zod menjadi bentuk yang diterima `<FieldError errors>`. */
export function toFieldErrors(messages?: string[]) {
  return messages?.map((message) => ({ message }))
}
