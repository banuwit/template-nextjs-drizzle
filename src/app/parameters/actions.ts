"use server"

import { revalidatePath } from "next/cache"
import { and, eq, isNull } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db"
import { parameters } from "@/db/schema"
import { isUniqueViolation } from "@/lib/db-errors"
import { requireUser } from "@/lib/session"
import { parameterFormSchema } from "@/lib/validations/parameter"

import type {
  ParameterActionState,
  ParameterFormFields,
  ParameterFormValues,
} from "./types"

/**
 * Kolom audit (`createdBy` / `updatedBy` / `deletedBy`) diisi uuid user yang
 * login, dari `requireUser()`.
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
          errors: { attributes: ["Invalid JSON"] },
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
          errors: { attributes: ["Attributes must be a JSON object, e.g. {\"icon\":\"star\"}"] },
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
  code: ["Code is already registered"],
}

export async function createParameter(
  _prevState: ParameterActionState,
  formData: FormData,
): Promise<ParameterActionState> {
  const user = await requireUser()

  const parsed = parseParameterForm(formData)

  if (!parsed.ok) {
    return parsed.state
  }

  try {
    await db
      .insert(parameters)
      .values({ ...parsed.data, createdBy: user.id, updatedBy: user.id })
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { errors: CODE_TAKEN, values: parsed.values }
    }
    throw error
  }

  revalidatePath("/parameters")
  return { ok: true, values: parsed.values }
}

/** `id` = uuid parameter (lihat `identityColumns`). */
export async function updateParameter(
  id: string,
  _prevState: ParameterActionState,
  formData: FormData,
): Promise<ParameterActionState> {
  const user = await requireUser()

  const parsed = parseParameterForm(formData)

  if (!parsed.ok) {
    return parsed.state
  }

  try {
    await db
      .update(parameters)
      .set({ ...parsed.data, updatedBy: user.id })
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
export async function deleteParameter(id: string): Promise<void> {
  const user = await requireUser()

  const [row] = await db
    .select({ isSystem: parameters.isSystem })
    .from(parameters)
    .where(and(eq(parameters.id, id), isNull(parameters.deletedAt)))
    .limit(1)

  if (!row) {
    throw new Error("Parameter not found")
  }

  if (row.isSystem) {
    throw new Error("System parameters cannot be deleted")
  }

  await db
    .update(parameters)
    .set({ deletedAt: new Date(), deletedBy: user.id })
    .where(and(eq(parameters.id, id), isNull(parameters.deletedAt)))

  revalidatePath("/parameters")
}
