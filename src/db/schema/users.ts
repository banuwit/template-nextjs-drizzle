import { pgTable, integer, varchar, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// $inferSelect / $inferInsert menghasilkan tipe TypeScript langsung dari definisi
// tabel. Jangan tulis tangan interface User di src/types/ — nanti ada dua sumber
// kebenaran dan bisa berbeda diam-diam.
//
// Konvensi nama kolom di proyek ini: ditulis manual, bukan lewat opsi `casing`.
// Argumen string pertama adalah nama kolom di Postgres. Properti satu kata boleh
// tanpa argumen (name, email, id); properti multi-kata WAJIB pakai argumen
// snake_case — createdAt -> timestamp("created_at"). Tanpa argumen itu kolomnya
// jadi "createdAt" yang harus selalu dikutip saat query manual di psql.
//
// Tidak ada yang menegakkan aturan ini otomatis: kolom yang terlewat tidak error,
// hanya nyempil camelCase. Biasakan membaca file SQL hasil `npm run db:generate`
// sebelum di-commit.
