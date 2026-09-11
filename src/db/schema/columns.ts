import { sql } from "drizzle-orm"
import {
  integer,
  timestamp,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core"

import { users } from "./users"

// Kolom bersama untuk semua tabel domain. File ini sengaja TIDAK di-export dari
// index.ts: isinya helper, bukan tabel.
//
// Import melingkar users.ts ↔ columns.ts aman karena `users` hanya disentuh di
// dalam callback `.references()`, yang dievaluasi lazily setelah semua modul
// selesai dimuat.

/**
 * Dua identitas per baris:
 * - kolom `id` (integer identity) = primary key internal; properti TS-nya
 *   `internalId`. Jangan dipakai di URL, action, atau relasi.
 * - kolom `uuid` (UUID v7) = identitas publik; properti TS-nya `id`. Semua FK,
 *   URL, dan argumen action memakai ini.
 *
 * Properti TS `id` sengaja menunjuk ke kolom `uuid`: Better Auth selalu membaca
 * field `id` pada model user dan tidak bisa dipetakan ulang, jadi agar relasi
 * sessions/accounts memakai uuid, `users.id` harus uuid. Pola yang sama dipakai
 * di semua tabel supaya `row.id` di kode selalu berarti uuid.
 *
 * `uuidv7()` bawaan Postgres 18+: urut waktu, jadi index B-tree tetap efisien.
 */
export function identityColumns() {
  return {
    internalId: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    id: uuid("uuid").notNull().unique().default(sql`uuidv7()`),
  }
}

function userRef(column: string) {
  return uuid(column).references((): AnyPgColumn => users.id, {
    onDelete: "set null",
  })
}

/**
 * Audit + soft delete. Tidak ada global scope seperti SoftDeletes di Eloquent:
 * setiap query WAJIB memfilter `isNull(table.deletedAt)` sendiri, dan setiap
 * action mengisi `createdBy` / `updatedBy` / `deletedBy` dari `requireUser()`.
 */
export function auditColumns() {
  return {
    createdAt: timestamp("created_at").notNull().defaultNow(),
    createdBy: userRef("created_by"),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    updatedBy: userRef("updated_by"),
    deletedAt: timestamp("deleted_at"),
    deletedBy: userRef("deleted_by"),
  }
}
