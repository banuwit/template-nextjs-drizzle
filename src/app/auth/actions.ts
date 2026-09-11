"use server"

import { APIError } from "better-auth/api"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"

import { auth } from "@/lib/auth"
import { consumeRateLimit, resetRateLimit } from "@/lib/rate-limit"
import { requireUser } from "@/lib/session"
import { changePasswordSchema, signInSchema } from "@/lib/validations/auth"

import type { ChangePasswordActionState, SignInActionState } from "./types"

const SIGN_IN_LIMIT = { limit: 5, windowMs: 5 * 60 * 1000 }

export async function signIn(
  _prevState: SignInActionState,
  formData: FormData
): Promise<SignInActionState> {
  const values = {
    email: String(formData.get("email") ?? "")
      .trim()
      .toLowerCase(),
    password: String(formData.get("password") ?? ""),
  }

  const parsed = signInSchema.safeParse(values)

  if (!parsed.success) {
    return {
      errors: z.flattenError(parsed.error).fieldErrors,
      values: { email: values.email },
    }
  }

  const requestHeaders = await headers()
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim()
  const rateLimitKey = `sign-in:${ip ?? "unknown"}:${parsed.data.email}`
  const limited = consumeRateLimit(rateLimitKey, SIGN_IN_LIMIT)

  if (!limited.ok) {
    return {
      errors: {
        form: [
          `Too many sign-in attempts. Try again in ${limited.retryAfterSeconds} seconds.`,
        ],
      },
      values: { email: parsed.data.email },
    }
  }

  try {
    await auth.api.signInEmail({
      body: { email: parsed.data.email, password: parsed.data.password },
      headers: requestHeaders,
    })
  } catch (error) {
    if (error instanceof APIError) {
      // Pesan sengaja generik: jangan bocorkan apakah email terdaftar.
      return {
        errors: { form: ["Invalid email or password"] },
        values: { email: parsed.data.email },
      }
    }
    throw error
  }

  resetRateLimit(rateLimitKey)
  // redirect() melempar secara internal, jadi harus di luar blok try.
  redirect("/dashboard")
}

export async function signOut(): Promise<void> {
  await auth.api.signOut({ headers: await headers() })
  redirect("/")
}

export async function changePassword(
  _prevState: ChangePasswordActionState,
  formData: FormData
): Promise<ChangePasswordActionState> {
  await requireUser()

  const parsed = changePasswordSchema.safeParse({
    currentPassword: String(formData.get("currentPassword") ?? ""),
    newPassword: String(formData.get("newPassword") ?? ""),
    passwordConfirmation: String(formData.get("passwordConfirmation") ?? ""),
  })

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors }
  }

  try {
    await auth.api.changePassword({
      body: {
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
        // Logout semua perangkat lain; sesi yang sedang dipakai diganti token baru.
        revokeOtherSessions: true,
      },
      headers: await headers(),
    })
  } catch (error) {
    if (error instanceof APIError) {
      if (error.body?.code === "INVALID_PASSWORD") {
        return { errors: { currentPassword: ["Current password is incorrect"] } }
      }
      return { errors: { form: ["Failed to change password. Please try again."] } }
    }
    throw error
  }

  return { ok: true }
}
