import "server-only"

import { desc, isNull } from "drizzle-orm"

import { db } from "@/db"
import { cities, type City } from "@/db/schema"
import { requireUser } from "@/lib/session"

/**
 * Seluruh baris yang belum di-soft-delete, bukan satu halaman: list-nya
 * dirender lewat `DataTableClient`, yang menyaring/mengurutkan/mem-paginasi di
 * browser atas array ini.
 */
export async function listCities(): Promise<City[]> {
  await requireUser()

  return db
    .select()
    .from(cities)
    .where(isNull(cities.deletedAt))
    .orderBy(desc(cities.createdAt), desc(cities.internalId))
}
