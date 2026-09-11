import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { users } from "./users";

// Tabel pendukung Better Auth (lihat src/lib/auth.ts). Nama tabel jamak karena
// adapter memakai `usePlural: true`; nama properti mengikuti model Better Auth
// (camelCase), nama kolom tetap snake_case manual sesuai konvensi repo.
//
// Sengaja TIDAK memakai identityColumns/auditColumns: Better Auth mengelola
// baris ini sendiri (hard delete saat logout/expired) dan tidak tahu deleted_at.
// id = uuid dari Postgres; auth.ts men-set `generateId: false` sehingga Better
// Auth tidak mengirim id saat insert.

export const sessions = pgTable("sessions", {
  id: uuid().primaryKey().default(sql`uuidv7()`),
  token: text().notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

/**
 * Satu baris per metode login milik user. Login email+password disimpan dengan
 * `providerId = "credential"` dan hash password di kolom `password` — bukan di
 * tabel users.
 */
export const accounts = pgTable("accounts", {
  id: uuid().primaryKey().default(sql`uuidv7()`),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text(),
  password: text(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const verifications = pgTable("verifications", {
  id: uuid().primaryKey().default(sql`uuidv7()`),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Session = typeof sessions.$inferSelect;
export type Account = typeof accounts.$inferSelect;
