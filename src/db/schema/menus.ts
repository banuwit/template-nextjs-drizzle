import {
  pgTable,
  index,
  integer,
  smallint,
  varchar,
  boolean,
  timestamp,
  type AnyPgColumn,
} from "drizzle-orm/pg-core"

import { users } from "./users"

/**
 * Port dari migrasi Laravel `Schema::create('menus', …)`. Sumber data untuk
 * sidebar: baris `parent_id = null` adalah menu induk, anaknya menunjuk ke
 * induknya.
 *
 * Catatan penyimpangan yang disengaja:
 * - `tinyInteger('level')` → `smallint`. Postgres tidak punya tinyint; smallint
 *   adalah integer terkecil yang ada (2 byte).
 * - `$table->id()` / `foreignId()` bigint → `integer identity`, supaya tipenya
 *   sama dengan `users.id` (FK dengan tipe berbeda ditolak Postgres).
 * - `softDeletes()` → kolom `deleted_at` nullable. Tidak ada global scope
 *   seperti Eloquent: setiap query WAJIB memfilter `isNull(deletedAt)` sendiri
 *   (lihat `src/app/menus/queries.ts`).
 *
 * `parentId` menunjuk ke tabel ini sendiri, jadi tipe kembalian callback-nya
 * harus dianotasi `AnyPgColumn` — tanpa itu TypeScript menyerah pada inferensi
 * melingkar.
 */
export const menus = pgTable(
  "menus",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    slug: varchar({ length: 255 }).notNull().unique(),
    icon: varchar({ length: 255 }),
    routeName: varchar("route_name", { length: 255 }),
    routePattern: varchar("route_pattern", { length: 255 }),
    parentId: integer("parent_id").references((): AnyPgColumn => menus.id, {
      onDelete: "cascade",
    }),
    level: smallint().notNull().default(0),
    sortOrder: integer("sort_order").notNull().default(0),
    layout: varchar({ length: 255 }).notNull().default("sidebar"),
    isActive: boolean("is_active").notNull().default(true),
    createdBy: integer("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    updatedBy: integer("updated_by").references(() => users.id, {
      onDelete: "set null",
    }),
    deletedBy: integer("deleted_by").references(() => users.id, {
      onDelete: "set null",
    }),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("menus_layout_idx").on(table.layout),
    index("menus_is_active_idx").on(table.isActive),
  ],
)

export type Menu = typeof menus.$inferSelect
export type NewMenu = typeof menus.$inferInsert
