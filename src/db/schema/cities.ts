import { sql } from "drizzle-orm"
import { pgTable, uniqueIndex, varchar } from "drizzle-orm/pg-core"

import { auditColumns, identityColumns } from "./columns"

/**
 * Unik hanya di antara baris yang belum dihapus (partial unique index), supaya
 * kode dari baris yang sudah di-soft-delete bisa dipakai lagi.
 */
export const cities = pgTable(
  "cities",
  {
    ...identityColumns(),
    name: varchar({ length: 255 }).notNull(),
    code: varchar({ length: 2 }).notNull(),
    ...auditColumns(),
  },
  (table) => [
    uniqueIndex("cities_name_unique")
      .on(table.name)
      .where(sql`${table.deletedAt} is null`),
    uniqueIndex("cities_code_unique")
      .on(table.code)
      .where(sql`${table.deletedAt} is null`),
  ]
)

export type City = typeof cities.$inferSelect
export type NewCity = typeof cities.$inferInsert
