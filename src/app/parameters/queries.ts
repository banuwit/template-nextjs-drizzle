import "server-only"

import { asc, isNull, sql } from "drizzle-orm"

import { db } from "@/db"
import { parameters, type Parameter } from "@/db/schema"
import { requireUser } from "@/lib/session"

/**
 * Tidak ada global scope seperti SoftDeletes di Eloquent: setiap query di file
 * ini harus menyertakan `isNull(parameters.deletedAt)` sendiri.
 */
const notDeleted = isNull(parameters.deletedAt)

/**
 * Seluruh baris, bukan satu halaman: list-nya dirender lewat `DataGridClient`,
 * yang menyaring/mengurutkan/mem-paginasi di browser atas array ini. Urutan
 * default `sort_order asc` cuma bekal awal — `DataGridClient` boleh
 * mengurutkan ulang tanpa query baru ke server.
 */
export async function listAllParameters(): Promise<Parameter[]> {
  await requireUser()

  return db
    .select()
    .from(parameters)
    .where(notDeleted)
    .orderBy(asc(parameters.sortOrder), asc(parameters.internalId))
}

/** Grup yang benar-benar ada di tabel, dipakai sebagai opsi facet. */
export async function listParameterGroups(): Promise<string[]> {
  await requireUser()

  const rows = await db
    .selectDistinct({ group: parameters.group })
    .from(parameters)
    .where(notDeleted)
    .orderBy(asc(parameters.group))
    .limit(50)

  return rows.map((row) => row.group).filter(Boolean)
}

/**
 * Default `sort_order` untuk form create: satu di atas nilai terbesar yang ada.
 * Global, bukan per grup — grup baru dipilih di form, jadi belum diketahui saat
 * halaman dirender.
 */
export async function nextSortOrder(): Promise<number> {
  await requireUser()

  const [row] = await db
    .select({ max: sql<number | null>`max(${parameters.sortOrder})` })
    .from(parameters)
    .where(notDeleted)

  return (row?.max ?? -1) + 1
}
