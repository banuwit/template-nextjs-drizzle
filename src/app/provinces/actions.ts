"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db"
import { provinces } from "@/db/schema"
import { isUniqueViolation } from "@/lib/db-errors"
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
  form: ["Nama atau kode sudah terdaftar"],
}

export async function createProvince(
  _prevState: ProvinceActionState,
  formData: FormData
): Promise<ProvinceActionState> {
  const parsed = parseProvinceForm(formData)

  if (!parsed.ok) {
    return parsed.state
  }

  try {
    await db.insert(provinces).values(parsed.data)
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { errors: NAME_OR_CODE_TAKEN, values: parsed.data }
    }
    throw error
  }

  revalidatePath("/provinces")
  return { ok: true, values: parsed.data }
}

export async function updateProvince(
  id: number,
  _prevState: ProvinceActionState,
  formData: FormData
): Promise<ProvinceActionState> {
  const parsed = parseProvinceForm(formData)

  if (!parsed.ok) {
    return parsed.state
  }

  try {
    await db.update(provinces).set(parsed.data).where(eq(provinces.id, id))
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { errors: NAME_OR_CODE_TAKEN, values: parsed.data }
    }
    throw error
  }

  revalidatePath("/provinces")
  return { ok: true, values: parsed.data }
}

export async function deleteProvince(id: number): Promise<void> {
  await db.delete(provinces).where(eq(provinces.id, id))
  revalidatePath("/provinces")
}
