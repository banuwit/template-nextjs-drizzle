import { z } from "zod"

/**
 * Dipakai bersama oleh create & update user. Nilai mentah dari FormData
 * dinormalisasi dulu (trim / lowercase) di `src/app/users/actions.ts`
 * sebelum di-`safeParse`, supaya pesan error mencerminkan nilai final.
 */
export const userFormSchema = z.object({
  name: z
    .string()
    .min(1, "Nama wajib diisi")
    .max(255, "Nama maksimal 255 karakter"),
  email: z
    .email("Format email tidak valid")
    .max(255, "Email maksimal 255 karakter"),
})
