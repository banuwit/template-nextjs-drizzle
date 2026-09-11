"use server"

import { revalidatePath } from "next/cache"
import { and, eq, inArray, isNull } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db"
import { menus } from "@/db/schema"
import { isUniqueViolation } from "@/lib/db-errors"
import { requireUser } from "@/lib/session"
import { menuFormSchema, slugify } from "@/lib/validations/menu"

import { getMenuLevel, listMenuSubtreeIds } from "./queries"
import type { MenuActionState, MenuFormFields } from "./types"

/**
 * Kolom audit (`createdBy` / `updatedBy` / `deletedBy`) diisi uuid user yang
 * login, dari `requireUser()`. Semua id menu di file ini = uuid.
 */

/** Switch yang mati TIDAK terkirim di FormData; form ini selalu mengirim
 *  hidden input "1" / "0" supaya nilainya eksplisit. */
function readBoolean(formData: FormData, name: string): boolean {
  return String(formData.get(name) ?? "0") === "1"
}

function readNullableString(formData: FormData, name: string): string | null {
  const raw = String(formData.get(name) ?? "").trim()

  return raw === "" ? null : raw
}

type ParseResult =
  | { ok: true; data: MenuFormFields }
  | { ok: false; state: MenuActionState }

function parseMenuForm(formData: FormData): ParseResult {
  const name = String(formData.get("name") ?? "").trim()
  const slugRaw = String(formData.get("slug") ?? "").trim()
  const parentRaw = String(formData.get("parentId") ?? "").trim()
  const sortOrderRaw = String(formData.get("sortOrder") ?? "").trim()

  const values: MenuFormFields = {
    name,
    // Slug kosong diturunkan dari nama supaya user tidak perlu mengetik dua kali.
    slug: slugify(slugRaw === "" ? name : slugRaw),
    icon: readNullableString(formData, "icon"),
    routeName: readNullableString(formData, "routeName"),
    routePattern: readNullableString(formData, "routePattern"),
    parentId: parentRaw === "" ? null : parentRaw,
    sortOrder: sortOrderRaw === "" ? 0 : Number(sortOrderRaw),
    layout: String(formData.get("layout") ?? "").trim() || "sidebar",
    isActive: readBoolean(formData, "isActive"),
  }

  const parsed = menuFormSchema.safeParse(values)

  if (!parsed.success) {
    return {
      ok: false,
      state: { errors: z.flattenError(parsed.error).fieldErrors, values },
    }
  }

  return { ok: true, data: { ...values, ...parsed.data } }
}

const SLUG_TAKEN: MenuActionState["errors"] = {
  slug: ["Slug sudah dipakai menu lain"],
}

/**
 * `level` bukan field form: nilainya selalu satu tingkat di bawah induk, dan
 * 0 untuk menu tanpa induk. Menyimpannya sebagai kolom (bukan menghitung saat
 * render) mengikuti migrasi aslinya, tapi sumber kebenarannya tetap `parent_id`.
 */
async function resolveLevel(
  parentId: string | null,
): Promise<{ ok: true; level: number } | { ok: false; state: MenuActionState }> {
  if (parentId === null) {
    return { ok: true, level: 0 }
  }

  const parentLevel = await getMenuLevel(parentId)

  if (parentLevel === null) {
    return {
      ok: false,
      state: { errors: { parentId: ["Menu induk tidak ditemukan"] } },
    }
  }

  return { ok: true, level: parentLevel + 1 }
}

/**
 * Menyamakan kembali `level` seluruh turunan sebuah menu setelah induknya
 * berpindah. Tanpa ini, memindahkan cabang membuat level anak-anaknya basi.
 */
async function relevelDescendants(rootId: string, rootLevel: number) {
  const rows = await db
    .select({ id: menus.id, parentId: menus.parentId, level: menus.level })
    .from(menus)
    .where(isNull(menus.deletedAt))

  const childrenOf = new Map<string, typeof rows>()

  rows.forEach((row) => {
    if (row.parentId === null) return
    childrenOf.set(row.parentId, [
      ...(childrenOf.get(row.parentId) ?? []),
      row,
    ])
  })

  const queue: { id: string; level: number }[] = [
    { id: rootId, level: rootLevel },
  ]
  const updates: { id: string; level: number }[] = []

  while (queue.length > 0) {
    const current = queue.shift() as { id: string; level: number }

    for (const child of childrenOf.get(current.id) ?? []) {
      const level = current.level + 1

      if (child.level !== level) {
        updates.push({ id: child.id, level })
      }

      queue.push({ id: child.id, level })
    }
  }

  for (const update of updates) {
    await db
      .update(menus)
      .set({ level: update.level })
      .where(eq(menus.id, update.id))
  }
}

export async function createMenu(
  _prevState: MenuActionState,
  formData: FormData,
): Promise<MenuActionState> {
  const user = await requireUser()

  const parsed = parseMenuForm(formData)

  if (!parsed.ok) {
    return parsed.state
  }

  const level = await resolveLevel(parsed.data.parentId ?? null)

  if (!level.ok) {
    return { ...level.state, values: parsed.data }
  }

  try {
    await db.insert(menus).values({
      ...parsed.data,
      level: level.level,
      createdBy: user.id,
      updatedBy: user.id,
    })
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { errors: SLUG_TAKEN, values: parsed.data }
    }
    throw error
  }

  revalidatePath("/menus")
  return { ok: true, values: parsed.data }
}

export async function updateMenu(
  id: string,
  _prevState: MenuActionState,
  formData: FormData,
): Promise<MenuActionState> {
  const user = await requireUser()

  const parsed = parseMenuForm(formData)

  if (!parsed.ok) {
    return parsed.state
  }

  const parentId = parsed.data.parentId ?? null

  // Sebuah menu tidak boleh menjadi induk dirinya sendiri atau turunannya —
  // itu memutus pohon menjadi siklus yang membuat sidebar berulang tak hingga.
  if (parentId !== null) {
    const subtree = await listMenuSubtreeIds(id)

    if (subtree.includes(parentId)) {
      return {
        errors: {
          parentId: [
            parentId === id
              ? "Menu tidak bisa menjadi induk dirinya sendiri"
              : "Menu induk tidak boleh diambil dari turunannya sendiri",
          ],
        },
        values: parsed.data,
      }
    }
  }

  const level = await resolveLevel(parentId)

  if (!level.ok) {
    return { ...level.state, values: parsed.data }
  }

  try {
    await db
      .update(menus)
      .set({ ...parsed.data, level: level.level, updatedBy: user.id })
      .where(and(eq(menus.id, id), isNull(menus.deletedAt)))
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { errors: SLUG_TAKEN, values: parsed.data }
    }
    throw error
  }

  await relevelDescendants(id, level.level)

  revalidatePath("/menus")
  return { ok: true, values: parsed.data }
}

/**
 * Soft delete: baris hanya ditandai `deleted_at`. Seluruh turunannya ikut
 * ditandai — FK `ON DELETE CASCADE` hanya berlaku untuk hapus fisik, jadi tanpa
 * ini anak-anaknya jadi yatim dan menunjuk induk yang sudah hilang.
 */
export async function deleteMenu(id: string): Promise<void> {
  const user = await requireUser()

  const ids = await listMenuSubtreeIds(id)

  if (ids.length === 0) {
    throw new Error("Menu tidak ditemukan")
  }

  await db
    .update(menus)
    .set({ deletedAt: new Date(), deletedBy: user.id })
    .where(and(inArray(menus.id, ids), isNull(menus.deletedAt)))

  revalidatePath("/menus")
}
