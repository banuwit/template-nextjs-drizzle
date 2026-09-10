import "server-only"

import { desc } from "drizzle-orm"

import { db } from "@/db"
import { countries, type Country } from "@/db/schema"

/**
 * Seluruh baris, bukan satu halaman: list-nya dirender lewat `DataTableClient`,
 * yang menyaring/mengurutkan/mem-paginasi di browser atas array ini.
 */
export async function listCountries(): Promise<Country[]> {
  return db
    .select()
    .from(countries)
    .orderBy(desc(countries.createdAt), desc(countries.id))
}
