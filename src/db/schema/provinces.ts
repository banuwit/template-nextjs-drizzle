import { sql } from "drizzle-orm"
import { pgTable, uniqueIndex, varchar } from "drizzle-orm/pg-core"

import { auditColumns, identityColumns } from "./columns"

/**
 * Unik hanya di antara baris yang belum dihapus (partial unique index), supaya
 * kode dari baris yang sudah di-soft-delete bisa dipakai lagi.
 */
export const provinces = pgTable(
  "provinces",
  {
    ...identityColumns(),
    name: varchar({ length: 255 }).notNull(),
    code: varchar({ length: 2 }).notNull(),
    ...auditColumns(),
  },
  (table) => [
    uniqueIndex("provinces_name_unique")
      .on(table.name)
      .where(sql`${table.deletedAt} is null`),
    uniqueIndex("provinces_code_unique")
      .on(table.code)
      .where(sql`${table.deletedAt} is null`),
  ]
)

export type Province = typeof provinces.$inferSelect
export type NewProvince = typeof provinces.$inferInsert
