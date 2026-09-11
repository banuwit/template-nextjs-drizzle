"use server"

import { revalidatePath } from "next/cache"
import { and, eq, isNull } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db"
import { provinces } from "@/db/schema"
import { isUniqueViolation } from "@/lib/db-errors"
import { requireUser } from "@/lib/session"
import { provinceFormSchema } from "@/lib/validations/province"

import type { ProvinceActionState, ProvinceFormFields } from "./types"

type ParseResult =
  | { ok: true; data: ProvinceFormFields }
  | { ok: false; state: ProvinceActionState }

function parseProvinceForm(formData: FormData): ParseResult {
  const values = {
    name: String(formData.get("name") ?? "").trim(),
    code: String(formData.get("code") ?? "")
      .trim()
      .toUpperCase(),
  }

  const parsed = provinceFormSchema.safeParse(values)

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

const NAME_OR_CODE_TAKEN: ProvinceActionState["errors"] = {
  form: ["Name or code is already registered"],
}

export async function createProvince(
  _prevState: ProvinceActionState,
  formData: FormData
): Promise<ProvinceActionState> {
  const user = await requireUser()

  const parsed = parseProvinceForm(formData)

  if (!parsed.ok) {
    return parsed.state
  }

  try {
    await db
      .insert(provinces)
      .values({ ...parsed.data, createdBy: user.id, updatedBy: user.id })
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { errors: NAME_OR_CODE_TAKEN, values: parsed.data }
    }
    throw error
  }

  revalidatePath("/provinces")
  return { ok: true, values: parsed.data }
}

/** `id` = uuid province (lihat `identityColumns`). */
export async function updateProvince(
  id: string,
  _prevState: ProvinceActionState,
  formData: FormData
): Promise<ProvinceActionState> {
  const user = await requireUser()

  const parsed = parseProvinceForm(formData)

  if (!parsed.ok) {
    return parsed.state
  }

  try {
    await db
      .update(provinces)
      .set({ ...parsed.data, updatedBy: user.id })
      .where(and(eq(provinces.id, id), isNull(provinces.deletedAt)))
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { errors: NAME_OR_CODE_TAKEN, values: parsed.data }
    }
    throw error
  }

  revalidatePath("/provinces")
  return { ok: true, values: parsed.data }
}

/** Soft delete: baris hanya ditandai `deleted_at` / `deleted_by`. */
export async function deleteProvince(id: string): Promise<void> {
  const user = await requireUser()

  await db
    .update(provinces)
    .set({ deletedAt: new Date(), deletedBy: user.id })
    .where(and(eq(provinces.id, id), isNull(provinces.deletedAt)))

  revalidatePath("/provinces")
}
