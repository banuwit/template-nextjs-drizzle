"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db"
import { countries } from "@/db/schema"
import { isUniqueViolation } from "@/lib/db-errors"
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
  const parsed = parseCountryForm(formData)

  if (!parsed.ok) {
    return parsed.state
  }

  try {
    await db.insert(countries).values(parsed.data)
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { errors: NAME_OR_CODE_TAKEN, values: parsed.data }
    }
    throw error
  }

  revalidatePath("/countries")
  return { ok: true, values: parsed.data }
}

export async function updateCountry(
  id: number,
  _prevState: CountryActionState,
  formData: FormData
): Promise<CountryActionState> {
  const parsed = parseCountryForm(formData)

  if (!parsed.ok) {
    return parsed.state
  }

  try {
    await db.update(countries).set(parsed.data).where(eq(countries.id, id))
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { errors: NAME_OR_CODE_TAKEN, values: parsed.data }
    }
    throw error
  }

  revalidatePath("/countries")
  return { ok: true, values: parsed.data }
}

export async function deleteCountry(id: number): Promise<void> {
  await db.delete(countries).where(eq(countries.id, id))
  revalidatePath("/countries")
}
