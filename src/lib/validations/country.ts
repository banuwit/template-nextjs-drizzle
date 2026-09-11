import { z } from "zod"

/**
 * Dipakai bersama oleh create & update country. Nilai mentah dari FormData
 * dinormalisasi dulu (trim / uppercase kode) di `src/app/countries/actions.ts`
 * sebelum di-`safeParse`.
 */
export const countryFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be at most 255 characters"),
  code: z
    .string()
    .length(2, "Code must be 2 letters")
    .regex(/^[A-Z]{2}$/, "Code must be 2 letters A–Z"),
})
