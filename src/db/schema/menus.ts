import { sql } from "drizzle-orm"
import {
  pgTable,
  index,
  uniqueIndex,
  integer,
  smallint,
  uuid,
  varchar,
  boolean,
  type AnyPgColumn,
} from "drizzle-orm/pg-core"

import { auditColumns, identityColumns } from "./columns"

/**
 * Port dari migrasi Laravel `Schema::create('menus', …)`. Sumber data untuk
 * sidebar: baris `parent_id = null` adalah menu induk, anaknya menunjuk ke
 * induknya.
 *
 * Catatan penyimpangan yang disengaja:
 * - `tinyInteger('level')` → `smallint`. Postgres tidak punya tinyint; smallint
 *   adalah integer terkecil yang ada (2 byte).
 * - `parent_id` merujuk ke kolom `uuid` (properti `menus.id`), bukan PK
 *   integer — semua relasi di repo ini memakai uuid (lihat columns.ts).
 * - `softDeletes()` → `deleted_at` dari `auditColumns()`. Setiap query WAJIB
 *   memfilter `isNull(deletedAt)` sendiri (lihat `src/app/menus/queries.ts`).
 *
 * `parentId` menunjuk ke tabel ini sendiri, jadi tipe kembalian callback-nya
 * harus dianotasi `AnyPgColumn` — tanpa itu TypeScript menyerah pada inferensi
 * melingkar.
 */
export const menus = pgTable(
  "menus",
  {
    ...identityColumns(),
    name: varchar({ length: 255 }).notNull(),
    slug: varchar({ length: 255 }).notNull(),
    icon: varchar({ length: 255 }),
    routeName: varchar("route_name", { length: 255 }),
    routePattern: varchar("route_pattern", { length: 255 }),
    parentId: uuid("parent_id").references((): AnyPgColumn => menus.id, {
      onDelete: "cascade",
    }),
    level: smallint().notNull().default(0),
    sortOrder: integer("sort_order").notNull().default(0),
    layout: varchar({ length: 255 }).notNull().default("sidebar"),
    isActive: boolean("is_active").notNull().default(true),
    ...auditColumns(),
  },
  (table) => [
    uniqueIndex("menus_slug_unique")
      .on(table.slug)
      .where(sql`${table.deletedAt} is null`),
    index("menus_layout_idx").on(table.layout),
    index("menus_is_active_idx").on(table.isActive),
  ],
)

export type Menu = typeof menus.$inferSelect
export type NewMenu = typeof menus.$inferInsert
