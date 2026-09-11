import { pgTable, varchar, text, boolean } from "drizzle-orm/pg-core";

import { auditColumns, identityColumns } from "./columns";

// Tabel ini juga model `user` Better Auth (src/lib/auth.ts): emailVerified,
// image, createdAt, dan updatedAt wajib ada untuk library itu. Password TIDAK
// di sini — hash-nya disimpan di tabel accounts (src/db/schema/auth.ts).
//
// `users.id` = kolom uuid (lihat identityColumns). Email tetap unik global,
// termasuk untuk user yang di-soft-delete: Better Auth mencari user berdasarkan
// email tanpa filter deleted_at, jadi dua baris dengan email sama tidak aman.
export const users = pgTable("users", {
  ...identityColumns(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text(),
  ...auditColumns(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// $inferSelect / $inferInsert menghasilkan tipe TypeScript langsung dari definisi
// tabel. Jangan tulis tangan interface User di src/types/ — nanti ada dua sumber
// kebenaran dan bisa berbeda diam-diam.
//
// Konvensi nama kolom di proyek ini: ditulis manual, bukan lewat opsi `casing`.
// Argumen string pertama adalah nama kolom di Postgres. Properti satu kata boleh
// tanpa argumen (name, email), properti multi-kata WAJIB pakai argumen
// snake_case — createdAt -> timestamp("created_at"). Pengecualian yang disengaja:
// `id` → kolom "uuid" dan `internalId` → kolom "id" (lihat columns.ts).
//
// Tidak ada yang menegakkan aturan ini otomatis: kolom yang terlewat tidak error,
// hanya nyempil camelCase. Biasakan membaca file SQL hasil `npm run db:generate`
// sebelum di-commit.
