import { sql } from "drizzle-orm"
import {
  pgTable,
  uniqueIndex,
  integer,
  varchar,
  text,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core"

import { auditColumns, identityColumns } from "./columns"

/**
 * Port dari migrasi Laravel `Schema::create('parameters', …)`.
 *
 * Catatan penyimpangan yang disengaja:
 * - `$table->json('attributes')` → `jsonb`, bukan `json`. Postgres menyimpan
 *   jsonb ter-parse sehingga bisa diindeks; `json` hanya teks mentah.
 * - `softDeletes()` → `deleted_at` dari `auditColumns()`. Setiap query WAJIB
 *   memfilter `isNull(deletedAt)` sendiri (lihat `src/app/parameters/queries.ts`).
 * - `code` unik hanya di antara baris yang belum dihapus (partial unique index).
 */
export const parameters = pgTable(
  "parameters",
  {
    ...identityColumns(),
    group: varchar({ length: 50 }).notNull(),
    code: varchar({ length: 100 }).notNull(),
    value: varchar({ length: 150 }).notNull(),
    description: text(),
    textColor: varchar("text_color", { length: 10 }),
    bgColor: varchar("bg_color", { length: 10 }),
    attributes: jsonb().$type<Record<string, unknown>>(),
    isSystem: boolean("is_system").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    ...auditColumns(),
  },
  (table) => [
    uniqueIndex("parameters_code_unique")
      .on(table.code)
      .where(sql`${table.deletedAt} is null`),
  ],
)

export type Parameter = typeof parameters.$inferSelect
export type NewParameter = typeof parameters.$inferInsert
