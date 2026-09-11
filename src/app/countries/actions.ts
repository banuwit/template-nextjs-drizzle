"use server"

import { revalidatePath } from "next/cache"
import { and, eq, isNull } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db"
import { countries } from "@/db/schema"
import { isUniqueViolation } from "@/lib/db-errors"
import { requireUser } from "@/lib/session"
import { countryFormSchema } from "@/lib/validations/country"

import type { CountryActionState, CountryFormFields } from "./types"

type ParseResult =
  | { ok: true; data: CountryFormFields }
  | { ok: false; state: CountryActionState }

function parseCountryForm(formData: FormData): ParseResult {
  const values = {
    name: String(formData.get("name") ?? "").trim(),
    code: String(formData.get("code") ?? "")
      .trim()
      .toUpperCase(),
  }

  const parsed = countryFormSchema.safeParse(values)

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

const NAME_OR_CODE_TAKEN: CountryActionState["errors"] = {
  form: ["Nama atau kode sudah terdaftar"],
}

export async function createCountry(
  _prevState: CountryActionState,
  formData: FormData
): Promise<CountryActionState> {
  const user = await requireUser()

  const parsed = parseCountryForm(formData)

  if (!parsed.ok) {
    return parsed.state
  }

  try {
    await db
      .insert(countries)
      .values({ ...parsed.data, createdBy: user.id, updatedBy: user.id })
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { errors: NAME_OR_CODE_TAKEN, values: parsed.data }
    }
    throw error
  }

  revalidatePath("/countries")
  return { ok: true, values: parsed.data }
}

/** `id` = uuid country (lihat `identityColumns`). */
export async function updateCountry(
  id: string,
  _prevState: CountryActionState,
  formData: FormData
): Promise<CountryActionState> {
  const user = await requireUser()

  const parsed = parseCountryForm(formData)

  if (!parsed.ok) {
    return parsed.state
  }

  try {
    await db
      .update(countries)
      .set({ ...parsed.data, updatedBy: user.id })
      .where(and(eq(countries.id, id), isNull(countries.deletedAt)))
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { errors: NAME_OR_CODE_TAKEN, values: parsed.data }
    }
    throw error
  }

  revalidatePath("/countries")
  return { ok: true, values: parsed.data }
}

/** Soft delete: baris hanya ditandai `deleted_at` / `deleted_by`. */
export async function deleteCountry(id: string): Promise<void> {
  const user = await requireUser()

  await db
    .update(countries)
    .set({ deletedAt: new Date(), deletedBy: user.id })
    .where(and(eq(countries.id, id), isNull(countries.deletedAt)))

  revalidatePath("/countries")
}
