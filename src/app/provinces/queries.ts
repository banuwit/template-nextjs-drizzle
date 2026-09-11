import "server-only"

import { desc, isNull } from "drizzle-orm"

import { db } from "@/db"
import { provinces, type Province } from "@/db/schema"
import { requireUser } from "@/lib/session"

/**
 * Seluruh baris yang belum di-soft-delete, bukan satu halaman: list-nya
 * dirender lewat `DataTableClient`, yang menyaring/mengurutkan/mem-paginasi di
 * browser atas array ini.
 */
export async function listProvinces(): Promise<Province[]> {
  await requireUser()

  return db
    .select()
    .from(provinces)
    .where(isNull(provinces.deletedAt))
    .orderBy(desc(provinces.createdAt), desc(provinces.internalId))
}
