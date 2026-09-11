import { z } from "zod"

/**
 * Dipakai bersama oleh create & update city. Nilai mentah dari FormData
 * dinormalisasi dulu (trim / uppercase kode) di `src/app/cities/actions.ts`
 * sebelum di-`safeParse`.
 */
export const cityFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be at most 255 characters"),
  code: z
    .string()
    .length(2, "Code must be 2 letters")
    .regex(/^[A-Z]{2}$/, "Code must be 2 letters A–Z"),
})
