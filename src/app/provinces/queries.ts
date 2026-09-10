import "server-only"

import { desc } from "drizzle-orm"

import { db } from "@/db"
import { provinces, type Province } from "@/db/schema"

/**
 * Seluruh baris, bukan satu halaman: list-nya dirender lewat `DataTableClient`,
 * yang menyaring/mengurutkan/mem-paginasi di browser atas array ini.
 */
export async function listProvinces(): Promise<Province[]> {
  return db
    .select()
    .from(provinces)
    .orderBy(desc(provinces.createdAt), desc(provinces.id))
}
