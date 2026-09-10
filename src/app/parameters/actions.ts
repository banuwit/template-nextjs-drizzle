"use server"

import { revalidatePath } from "next/cache"
import { and, eq, isNull } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db"
import { parameters } from "@/db/schema"
import { isUniqueViolation } from "@/lib/db-errors"
import { parameterFormSchema } from "@/lib/validations/parameter"

import type {
  ParameterActionState,
  ParameterFormFields,
  ParameterFormValues,
} from "./types"

/**
 * Kolom audit (`createdBy` / `updatedBy` / `deletedBy`) sengaja dibiarkan null:
 * project ini belum punya sesi auth, jadi tidak ada user id yang bisa dicatat.
 * Kolomnya sudah ada di schema — tinggal diisi begitu auth dipasang.
 */

/** Checkbox/Switch yang tidak tercentang TIDAK terkirim di FormData; form ini
 *  mengirim hidden input "1"/"0" supaya nilainya selalu eksplisit. */
function readBoolean(formData: FormData, name: string): boolean {
  return String(formData.get(name) ?? "0") === "1"
}

function readNullableString(formData: FormData, name: string): string | null {
  const raw = String(formData.get(name) ?? "").trim()

  return raw === "" ? null : raw
}

type ParseResult =
  | { ok: true; data: ParameterFormFields; values: ParameterFormValues }
  | { ok: false; state: ParameterActionState }

function parseParameterForm(formData: FormData): ParseResult {
  const attributesRaw = String(formData.get("attributes") ?? "").trim()
  const sortOrderRaw = String(formData.get("sortOrder") ?? "").trim()

  // Bentuk yang dikembalikan ke form saat gagal: `attributes` tetap string
  // mentah supaya textarea menampilkan persis apa yang tadi diketik.
  const values: ParameterFormValues = {
    group: String(formData.get("group") ?? "").trim(),
    code: String(formData.get("code") ?? "")
      .trim()
      .toUpperCase(),
    value: String(formData.get("value") ?? "").trim(),
    description: readNullableString(formData, "description"),
    textColor: readNullableString(formData, "textColor"),
    bgColor: readNullableString(formData, "bgColor"),
    attributes: attributesRaw,
    isSystem: readBoolean(formData, "isSystem"),
    isActive: readBoolean(formData, "isActive"),
    sortOrder: sortOrderRaw === "" ? 0 : Number(sortOrderRaw),
  }

  let attributes: Record<string, unknown> | null = null

  if (attributesRaw !== "") {
    let parsedJson: unknown

    try {
      parsedJson = JSON.parse(attributesRaw)
    } catch {
      return {
        ok: false,
        state: {
          errors: { attributes: ["JSON tidak valid"] },
          values,
        },
      }
    }

    if (
      parsedJson === null ||
      typeof parsedJson !== "object" ||
      Array.isArray(parsedJson)
    ) {
      return {
        ok: false,
        state: {
          errors: { attributes: ["Attributes harus objek JSON, mis. {\"icon\":\"star\"}"] },
          values,
        },
      }
    }

    attributes = parsedJson as Record<string, unknown>
  }

  const parsed = parameterFormSchema.safeParse({ ...values, attributes })

  if (!parsed.success) {
    return {
      ok: false,
      state: {
        errors: z.flattenError(parsed.error).fieldErrors,
        values,
      },
    }
  }

  return { ok: true, data: parsed.data, values }
}

const CODE_TAKEN: ParameterActionState["errors"] = {
  code: ["Kode sudah terdaftar"],
}

export async function createParameter(
  _prevState: ParameterActionState,
  formData: FormData,
): Promise<ParameterActionState> {
  const parsed = parseParameterForm(formData)

  if (!parsed.ok) {
    return parsed.state
  }

  try {
    await db.insert(parameters).values(parsed.data)
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { errors: CODE_TAKEN, values: parsed.values }
    }
    throw error
  }

  revalidatePath("/parameters")
  return { ok: true, values: parsed.values }
}

export async function updateParameter(
  id: number,
  _prevState: ParameterActionState,
  formData: FormData,
): Promise<ParameterActionState> {
  const parsed = parseParameterForm(formData)

  if (!parsed.ok) {
    return parsed.state
  }

  try {
    await db
      .update(parameters)
      .set(parsed.data)
      .where(and(eq(parameters.id, id), isNull(parameters.deletedAt)))
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { errors: CODE_TAKEN, values: parsed.values }
    }
    throw error
  }

  revalidatePath("/parameters")
  return { ok: true, values: parsed.values }
}

/**
 * Soft delete: baris hanya ditandai `deleted_at`, tidak dihapus. Baris dengan
 * `is_system` dipakai kode lain, jadi ditolak di server — bukan hanya
 * disembunyikan tombolnya di UI.
 */
export async function deleteParameter(id: number): Promise<void> {
  const [row] = await db
    .select({ isSystem: parameters.isSystem })
    .from(parameters)
    .where(and(eq(parameters.id, id), isNull(parameters.deletedAt)))
    .limit(1)

  if (!row) {
    throw new Error("Parameter tidak ditemukan")
  }

  if (row.isSystem) {
    throw new Error("Parameter sistem tidak bisa dihapus")
  }

  await db
    .update(parameters)
    .set({ deletedAt: new Date() })
    .where(and(eq(parameters.id, id), isNull(parameters.deletedAt)))

  revalidatePath("/parameters")
}
