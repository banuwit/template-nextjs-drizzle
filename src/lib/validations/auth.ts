import { z } from "zod"

/**
 * Aturan password dipakai bersama oleh login, ganti password, dan create user.
 * Batas 8–128 sama dengan `minPasswordLength` / `maxPasswordLength` Better Auth
 * (src/lib/auth.ts) supaya pesan zod muncul sebelum library menolak.
 */
export const passwordSchema = z
  .string()
  .min(8, "Password minimal 8 karakter")
  .max(128, "Password maksimal 128 karakter")

export const signInSchema = z.object({
  email: z.email("Format email tidak valid"),
  // Saat login cukup cek terisi: aturan panjang hanya relevan saat membuat password.
  password: z.string().min(1, "Password wajib diisi"),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
    newPassword: passwordSchema,
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.newPassword === data.passwordConfirmation, {
    message: "Konfirmasi password tidak cocok",
    path: ["passwordConfirmation"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "Password baru harus berbeda dari password saat ini",
    path: ["newPassword"],
  })
