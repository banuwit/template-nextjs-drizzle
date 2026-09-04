"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db"
import { cities } from "@/db/schema"
import { isUniqueViolation } from "@/lib/db-errors"
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
  form: ["Nama atau kode sudah terdaftar"],
}

export async function createCity(
  _prevState: CityActionState,
  formData: FormData
): Promise<CityActionState> {
  const parsed = parseCityForm(formData)

  if (!parsed.ok) {
    return parsed.state
  }

  try {
    await db.insert(cities).values(parsed.data)
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { errors: NAME_OR_CODE_TAKEN, values: parsed.data }
    }
    throw error
  }

  revalidatePath("/cities")
  return { ok: true, values: parsed.data }
}

export async function updateCity(
  id: number,
  _prevState: CityActionState,
  formData: FormData
): Promise<CityActionState> {
  const parsed = parseCityForm(formData)

  if (!parsed.ok) {
    return parsed.state
  }

  try {
    await db.update(cities).set(parsed.data).where(eq(cities.id, id))
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { errors: NAME_OR_CODE_TAKEN, values: parsed.data }
    }
    throw error
  }

  revalidatePath("/cities")
  return { ok: true, values: parsed.data }
}

export async function deleteCity(id: number): Promise<void> {
  await db.delete(cities).where(eq(cities.id, id))
  revalidatePath("/cities")
}
