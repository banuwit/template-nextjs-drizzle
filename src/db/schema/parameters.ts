import {
  pgTable,
  integer,
  varchar,
  text,
  jsonb,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core"

import { users } from "./users"

/**
 * Port dari migrasi Laravel `Schema::create('parameters', …)`.
 *
 * Catatan penyimpangan yang disengaja:
 * - `$table->json('attributes')` → `jsonb`, bukan `json`. Postgres menyimpan
 *   jsonb ter-parse sehingga bisa diindeks; `json` hanya teks mentah.
 * - `$table->id()` / `foreignId()` di Laravel bigint; di sini `integer identity`
 *   supaya tipenya sama dengan `users.id` (lihat `users.ts`) — FK dengan tipe
 *   berbeda ditolak Postgres.
 * - `softDeletes()` → kolom `deleted_at` nullable. Tidak ada global scope
 *   seperti Eloquent: setiap query WAJIB memfilter `isNull(deletedAt)` sendiri
 *   (lihat `src/app/parameters/queries.ts`).
 */
export const parameters = pgTable("parameters", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  group: varchar({ length: 50 }).notNull(),
  code: varchar({ length: 100 }).notNull().unique(),
  value: varchar({ length: 150 }).notNull(),
  description: text(),
  textColor: varchar("text_color", { length: 10 }),
  bgColor: varchar("bg_color", { length: 10 }),
  attributes: jsonb().$type<Record<string, unknown>>(),
  isSystem: boolean("is_system").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdBy: integer("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  updatedBy: integer("updated_by").references(() => users.id, {
    onDelete: "set null",
  }),
  deletedAt: timestamp("deleted_at"),
  deletedBy: integer("deleted_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export type Parameter = typeof parameters.$inferSelect
export type NewParameter = typeof parameters.$inferInsert
