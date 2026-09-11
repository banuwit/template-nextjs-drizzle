import { z } from "zod"

/**
 * Aturan password dipakai bersama oleh login, ganti password, dan create user.
 * Batas 8–128 sama dengan `minPasswordLength` / `maxPasswordLength` Better Auth
 * (src/lib/auth.ts) supaya pesan zod muncul sebelum library menolak.
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters")

export const signInSchema = z.object({
  email: z.email("Invalid email format"),
  // Saat login cukup cek terisi: aturan panjang hanya relevan saat membuat password.
  password: z.string().min(1, "Password is required"),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.newPassword === data.passwordConfirmation, {
    message: "Password confirmation does not match",
    path: ["passwordConfirmation"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password must differ from the current password",
    path: ["newPassword"],
  })
