"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db"
import { users } from "@/db/schema"
import { isUniqueViolation } from "@/lib/db-errors"
import { userFormSchema } from "@/lib/validations/user"

import type { UserActionState, UserFormFields } from "./types"

type ParseResult =
  | { ok: true; data: UserFormFields }
  | { ok: false; state: UserActionState }

/** Normalisasi FormData lalu validasi. Dipakai create & update. */
function parseUserForm(formData: FormData): ParseResult {
  const values = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "")
      .trim()
      .toLowerCase(),
  }

  const parsed = userFormSchema.safeParse(values)

  if (!parsed.success) {
    return {
      ok: false,
      state: {
        errors: z.flattenError(parsed.error).fieldErrors,
        values,
      },
    }
  }

  return { ok: true, data: parsed.data }
}

const EMAIL_TAKEN: UserActionState["errors"] = { email: ["Email sudah terdaftar"] }

export async function createUser(
  _prevState: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  const parsed = parseUserForm(formData)

  if (!parsed.ok) {
    return parsed.state
  }

  try {
    // `id` sengaja tidak dikirim: kolomnya generatedAlwaysAsIdentity.
    await db.insert(users).values(parsed.data)
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { errors: EMAIL_TAKEN, values: parsed.data }
    }
    throw error
  }

  revalidatePath("/users")
  // redirect() melempar secara internal, jadi harus di luar blok try.
  redirect("/users")
}

export async function updateUser(
  id: number,
  _prevState: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  const parsed = parseUserForm(formData)

  if (!parsed.ok) {
    return parsed.state
  }

  try {
    await db.update(users).set(parsed.data).where(eq(users.id, id))
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { errors: EMAIL_TAKEN, values: parsed.data }
    }
    throw error
  }

  revalidatePath("/users")
  revalidatePath(`/users/${id}`)
  redirect(`/users/${id}`)
}

export async function deleteUser(id: number): Promise<void> {
  await db.delete(users).where(eq(users.id, id))
  revalidatePath("/users")
}
