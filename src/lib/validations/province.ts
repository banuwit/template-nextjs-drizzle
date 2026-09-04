import { z } from "zod"

/**
 * Dipakai bersama oleh create & update province. Nilai mentah dari FormData
 * dinormalisasi dulu (trim / uppercase kode) di `src/app/provinces/actions.ts`
 * sebelum di-`safeParse`.
 */
export const provinceFormSchema = z.object({
  name: z
    .string()
    .min(1, "Nama wajib diisi")
    .max(255, "Nama maksimal 255 karakter"),
  code: z
    .string()
    .length(2, "Kode harus 2 huruf")
    .regex(/^[A-Z]{2}$/, "Kode harus 2 huruf A–Z"),
})
