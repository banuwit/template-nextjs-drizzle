import { z } from "zod"

import { passwordSchema } from "./auth"

/**
 * Dipakai bersama oleh create & update user. Nilai mentah dari FormData
 * dinormalisasi dulu (trim / lowercase) di `src/app/users/actions.ts`
 * sebelum di-`safeParse`, supaya pesan error mencerminkan nilai final.
 */
export const userFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be at most 255 characters"),
  email: z
    .email("Invalid email format")
    .max(255, "Email must be at most 255 characters"),
})

/** Create user = field biasa + password awal. Edit tidak menyentuh password. */
export const userCreateSchema = userFormSchema
  .extend({
    password: passwordSchema,
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Password confirmation does not match",
    path: ["passwordConfirmation"],
  })
