"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { and, eq, isNull } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db"
import { accounts, sessions, users } from "@/db/schema"
import { auth } from "@/lib/auth"
import { isUniqueViolation } from "@/lib/db-errors"
import { requireUser } from "@/lib/session"
import { userCreateSchema, userFormSchema } from "@/lib/validations/user"

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
  const currentUser = await requireUser()

  const values = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "")
      .trim()
      .toLowerCase(),
  }

  const parsed = userCreateSchema.safeParse({
    ...values,
    password: String(formData.get("password") ?? ""),
    passwordConfirmation: String(formData.get("passwordConfirmation") ?? ""),
  })

  if (!parsed.success) {
    // Password tidak ikut dikembalikan: jangan kirim ulang rahasia ke client.
    return { errors: z.flattenError(parsed.error).fieldErrors, values }
  }

  // Hash memakai hasher Better Auth supaya cocok saat signInEmail memverifikasi.
  const passwordHash = await (await auth.$context).password.hash(
    parsed.data.password
  )

  try {
    // User + akun credential dalam satu transaksi: tidak ada user tanpa password.
    await db.transaction(async (tx) => {
      // `internalId` dan `id` (uuid) sengaja tidak dikirim: diisi Postgres.
      const [user] = await tx
        .insert(users)
        .values({
          name: parsed.data.name,
          email: parsed.data.email,
          createdBy: currentUser.id,
          updatedBy: currentUser.id,
        })
        .returning({ id: users.id })

      await tx.insert(accounts).values({
        userId: user!.id,
        accountId: String(user!.id),
        providerId: "credential",
        password: passwordHash,
      })
    })
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { errors: EMAIL_TAKEN, values }
    }
    throw error
  }

  revalidatePath("/users")
  // redirect() melempar secara internal, jadi harus di luar blok try.
  redirect("/users")
}

/** `id` = uuid user (lihat `identityColumns`). */
export async function updateUser(
  id: string,
  _prevState: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  const currentUser = await requireUser()

  const parsed = parseUserForm(formData)

  if (!parsed.ok) {
    return parsed.state
  }

  try {
    await db
      .update(users)
      .set({ ...parsed.data, updatedBy: currentUser.id })
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
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

/**
 * Soft delete + cabut semua sesi user itu, supaya ia langsung ter-logout.
 * Login berikutnya ditolak hook `databaseHooks.session.create` di auth.ts.
 * Baris accounts (password) dibiarkan: user bisa dipulihkan dengan
 * mengosongkan `deleted_at`. Email tetap terpakai (unik global).
 */
export async function deleteUser(id: string): Promise<void> {
  const currentUser = await requireUser()

  if (currentUser.id === id) {
    throw new Error("Tidak bisa menghapus akun yang sedang dipakai login.")
  }

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({ deletedAt: new Date(), deletedBy: currentUser.id })
      .where(and(eq(users.id, id), isNull(users.deletedAt)))

    await tx.delete(sessions).where(eq(sessions.userId, id))
  })

  revalidatePath("/users")
}
