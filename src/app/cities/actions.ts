"use server"

import { revalidatePath } from "next/cache"
import { and, eq, isNull } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db"
import { cities } from "@/db/schema"
import { isUniqueViolation } from "@/lib/db-errors"
import { requireUser } from "@/lib/session"
import { cityFormSchema } from "@/lib/validations/city"

import type { CityActionState, CityFormFields } from "./types"

type ParseResult =
  | { ok: true; data: CityFormFields }
  | { ok: false; state: CityActionState }

function parseCityForm(formData: FormData): ParseResult {
  const values = {
    name: String(formData.get("name") ?? "").trim(),
    code: String(formData.get("code") ?? "")
      .trim()
      .toUpperCase(),
  }

  const parsed = cityFormSchema.safeParse(values)

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

const NAME_OR_CODE_TAKEN: CityActionState["errors"] = {
  form: ["Name or code is already registered"],
}

export async function createCity(
  _prevState: CityActionState,
  formData: FormData
): Promise<CityActionState> {
  const user = await requireUser()

  const parsed = parseCityForm(formData)

  if (!parsed.ok) {
    return parsed.state
  }

  try {
    await db
      .insert(cities)
      .values({ ...parsed.data, createdBy: user.id, updatedBy: user.id })
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { errors: NAME_OR_CODE_TAKEN, values: parsed.data }
    }
    throw error
  }

  revalidatePath("/cities")
  return { ok: true, values: parsed.data }
}

/** `id` = uuid city (lihat `identityColumns`). */
export async function updateCity(
  id: string,
  _prevState: CityActionState,
  formData: FormData
): Promise<CityActionState> {
  const user = await requireUser()

  const parsed = parseCityForm(formData)

  if (!parsed.ok) {
    return parsed.state
  }

  try {
    await db
      .update(cities)
      .set({ ...parsed.data, updatedBy: user.id })
      .where(and(eq(cities.id, id), isNull(cities.deletedAt)))
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { errors: NAME_OR_CODE_TAKEN, values: parsed.data }
    }
    throw error
  }

  revalidatePath("/cities")
  return { ok: true, values: parsed.data }
}

/** Soft delete: baris hanya ditandai `deleted_at` / `deleted_by`. */
export async function deleteCity(id: string): Promise<void> {
  const user = await requireUser()

  await db
    .update(cities)
    .set({ deletedAt: new Date(), deletedBy: user.id })
    .where(and(eq(cities.id, id), isNull(cities.deletedAt)))

  revalidatePath("/cities")
}
