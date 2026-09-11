import "server-only"

import { desc, isNull } from "drizzle-orm"

import { db } from "@/db"
import { countries, type Country } from "@/db/schema"
import { requireUser } from "@/lib/session"

/**
 * Seluruh baris yang belum di-soft-delete, bukan satu halaman: list-nya
 * dirender lewat `DataTableClient`, yang menyaring/mengurutkan/mem-paginasi di
 * browser atas array ini.
 */
export async function listCountries(): Promise<Country[]> {
  await requireUser()

  return db
    .select()
    .from(countries)
    .where(isNull(countries.deletedAt))
    .orderBy(desc(countries.createdAt), desc(countries.internalId))
}
