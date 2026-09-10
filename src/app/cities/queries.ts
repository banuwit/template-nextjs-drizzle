import "server-only"

import { desc } from "drizzle-orm"

import { db } from "@/db"
import { cities, type City } from "@/db/schema"

/**
 * Seluruh baris, bukan satu halaman: list-nya dirender lewat `DataTableClient`,
 * yang menyaring/mengurutkan/mem-paginasi di browser atas array ini.
 */
export async function listCities(): Promise<City[]> {
  return db
    .select()
    .from(cities)
    .orderBy(desc(cities.createdAt), desc(cities.id))
}
