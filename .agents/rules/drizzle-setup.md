# Drizzle + PostgreSQL — Setup & Cara Pakai

Catatan setup data layer proyek ini: apa yang dipasang, kenapa begitu, dan cara menambah tabel baru.
Status: **sudah terpasang dan terverifikasi** (migrasi jalan, halaman berhasil membaca database).

## Keputusan yang mendasari

| Hal | Pilihan | Alasan |
|---|---|---|
| Database | PostgreSQL lokal (Postgres.app 18) di `localhost:5432` | Sudah tersedia di mesin |
| Versi | `drizzle-orm@0.45.2` + `drizzle-kit@0.31.10` (stabil) | Halaman get-started menyarankan `@rc` (v1), tapi API v1 berbeda (`snakeCase.table()`, `defineRelations()`) dan mayoritas contoh di internet masih v0 |
| Nama kolom | Ditulis manual per kolom | Tidak bergantung API yang berubah antar versi; berlaku sama di v0 maupun v1 |
| Migrasi | `generate` + `migrate` (versioned) | `push` hanya untuk iterasi lokal |

> **Jangan naikkan ke `drizzle-orm@rc` / v1 tanpa rencana.** Di v1, opsi `casing` dihapus dari config dan diganti `snakeCase.table()`, serta relasi memakai `defineRelations()`. Seluruh catatan di bawah ditulis untuk v0.

---

## Tahap setup

### 1. `.gitignore`

```
.env*
!.env.example
```

Baris `.env*` bawaan create-next-app ikut mengabaikan `.env.example`, padahal file itu justru harus di-commit sebagai contoh untuk anggota tim. Baris pengecualian mengembalikannya.

### 2. Database

```bash
# Postgres.app tidak menaruh psql di PATH:
PSQL=/Applications/Postgres.app/Contents/Versions/latest/bin/psql

$PSQL "postgresql://postgres:postgres@localhost:5432/postgres" \
  -c 'CREATE DATABASE "db-template-nextjs-drizzle";'
```

Nama database mengandung tanda hubung, jadi **wajib** dikutip ganda di SQL. Uji koneksi sebelum lanjut — kalau langkah ini gagal, semua langkah berikutnya ikut gagal:

```bash
$PSQL "$DATABASE_URL" -c "SELECT version();"
```

### 3. Environment

`.env` (tidak di-commit):

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/db-template-nextjs-drizzle
```

`.env.example` (di-commit, tanpa password asli) memakai bentuk yang sama dengan placeholder.

Password dengan karakter spesial (`@`, `:`, `/`, `#`) harus di-URL-encode — `p@ss` menjadi `p%40ss`.

**`.env` vs `.env.local`:** proyek ini memakai `.env`. `.env.local` prioritasnya lebih tinggi dan menimpa `.env` — jangan isi `DATABASE_URL` di dua file dengan nilai berbeda, karena saat debugging sulit dilacak mana yang sedang berlaku.

### 4. Dependency

```bash
npm i drizzle-orm@0.45.2 pg
npm i -D drizzle-kit@0.31.10 @types/pg
```

| Paket | Peran |
|---|---|
| `drizzle-orm` | ORM-nya, dipakai runtime aplikasi |
| `pg` | Driver PostgreSQL untuk Node |
| `drizzle-kit` | CLI `generate` / `migrate` / `push` / `studio`, dev-only |
| `@types/pg` | Type definition `pg` |

Dua paket di docs yang **tidak** dipasang: `tsx` (drizzle-kit sudah bisa membaca `drizzle.config.ts` sendiri; baru perlu untuk skrip seed) dan `dotenv` (lihat tahap 5).

### 5. `drizzle.config.ts`

```ts
import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

loadEnvConfig(process.cwd());

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
  verbose: true,
  strict: true,
});
```

- **`@next/env`, bukan `dotenv`.** Docs Drizzle memakai `dotenv`, tapi `@next/env` (ikut terpasang bersama `next`) memuat `.env.local` → `.env.development` → `.env` dengan urutan prioritas yang **persis sama** dengan `next dev`. Tanpa itu ada risiko drizzle-kit menyambung ke database yang berbeda dari aplikasi.
- `loadEnvConfig` harus dipanggil **sebelum** `defineConfig`, karena `process.env.DATABASE_URL` dibaca saat objek config dibentuk.
- `schema` menunjuk ke **barrel file**, bukan satu file `schema.ts` seperti di docs.
- `out: "./drizzle"` — folder ini beserta `drizzle/meta/` **wajib di-commit**. `meta/` menyimpan snapshot yang dipakai menghitung diff migrasi berikutnya; menghapusnya membuat `generate` berikutnya salah.

### 6. Schema

> **Catatan:** contoh schema di dokumen ini adalah setup minimal Drizzle. Tabel domain di repo ini memakai `...identityColumns()` + `...auditColumns()` dari [`src/db/schema/columns.ts`](../../src/db/schema/columns.ts) — `id` publik = uuid v7, FK = `uuid(...)`, soft delete. Lihat [`countries.ts`](../../src/db/schema/countries.ts) sebagai acuan, bukan contoh `integer` di bawah.

`src/db/schema/users.ts`:

```ts
import { pgTable, integer, varchar, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

`src/db/schema/index.ts`:

```ts
export * from "./users";
```

**Aturan penamaan kolom (manual):** argumen string pertama adalah nama kolom di Postgres.
- Properti satu kata boleh tanpa argumen: `name`, `email`, `id`
- Properti multi-kata **wajib** pakai argumen snake_case: `createdAt: timestamp("created_at")`

Tanpa argumen itu kolomnya bernama `"createdAt"` dan harus selalu dikutip saat query manual di psql. Tidak ada yang menegakkan aturan ini otomatis — kolom yang terlewat tidak menimbulkan error, hanya nyempil camelCase di antara yang lain.

**Tipe diturunkan dari tabel**, bukan ditulis tangan. Jangan bikin `interface User` di `src/types/` — nanti ada dua sumber kebenaran yang bisa berbeda diam-diam.

### 7. Koneksi — `src/db/index.ts`

```ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { pool?: Pool };

const pool =
  globalForDb.pool ??
  new Pool({ connectionString: process.env.DATABASE_URL! });

if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export const db = drizzle(pool, { schema });
```

Tiga hal yang **berbeda dari contoh di docs Drizzle**:

1. **Pool disimpan di `globalThis`.** Saat `next dev`, hot reload mengevaluasi ulang modul tiap kali file disimpan. Kalau `new Pool()` dipanggil polos, tiap reload membuat pool baru sementara yang lama tidak ditutup — beberapa menit kemudian Postgres menolak koneksi dengan `too many clients already`. Di produksi tidak ada HMR sehingga tidak perlu disimpan.
2. **`{ schema }` dioper ke `drizzle()`** untuk mengaktifkan relational query API (`db.query.users.findMany(...)`). Tanpa itu hanya tersedia query builder (`db.select().from(users)`).
3. **Tanpa `import 'dotenv/config'`.** Next.js sudah memuat `.env` sendiri, dan `dotenv/config` di dalam kode aplikasi bisa menimpa env produksi yang di-inject platform hosting.

### 8. Script

```json
"db:generate": "drizzle-kit generate",
"db:migrate":  "drizzle-kit migrate",
"db:push":     "drizzle-kit push",
"db:studio":   "drizzle-kit studio"
```

| Perintah | Yang terjadi | Kapan |
|---|---|---|
| `db:generate` | Tulis file SQL baru ke `drizzle/`. Database belum tersentuh | Setelah ubah schema |
| `db:migrate` | Jalankan file SQL yang belum pernah dijalankan | Setelah `generate`, dan saat deploy |
| `db:push` | Ubah database langsung tanpa file SQL | Iterasi lokal saja — **jangan** ke production |
| `db:studio` | GUI untuk lihat/edit data | Kapan saja |

**Jangan campur `push` dan `generate` di database yang sama.** `push` membuat tabelnya duluan, lalu `migrate` gagal dengan `relation "users" already exists`. Kalau mau bereksperimen dengan `push`, pakai database terpisah.

### 9. Verifikasi

```bash
npm run db:generate && cat drizzle/0000_*.sql   # baca SQL-nya dulu
npm run db:migrate
npm run db:studio
npx tsc --noEmit && npm run lint && npm run build
```

Pada output `npm run build`, rute yang query database harus bertanda **`ƒ` (Dynamic)**, bukan `○` (Static) — lihat catatan berikutnya.

### 10. Query dari Server Component

```tsx
export const dynamic = "force-dynamic";

export default async function Page() {
  const rows = await db.select().from(users);
  // ...
}
```

**`force-dynamic` itu wajib untuk halaman yang membaca database.** Tanpa itu Next.js memprerender halaman saat `next build`: query dijalankan sekali lalu hasilnya dibekukan, sehingga data baru tidak pernah muncul di produksi. Gejalanya halus — build sukses, halaman tampil normal, tapi datanya basi selamanya.

---

## Langkah lanjutan: menambah tabel baru

Contoh menambah tabel `posts` yang berelasi ke `users`.

### 1. Buat file schema

`src/db/schema/posts.ts`:

```ts
import { pgTable, integer, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const posts = pgTable("posts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  body: text(),
  authorId: integer("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
```

Catatan:
- `authorId` multi-kata → wajib `integer("author_id")`.
- `.references(() => users.id)` memakai arrow function agar tidak kena masalah urutan import melingkar.
- `onDelete: "cascade"` harus disengaja. Alternatifnya `"restrict"` (tolak hapus user yang masih punya post) atau `"set null"` (kolomnya harus nullable). Pilih sesuai kebutuhan, jangan asal ikut contoh.

### 2. Export dari barrel — **paling sering terlupa**

`src/db/schema/index.ts`:

```ts
export * from "./users";
export * from "./posts";
```

Kalau langkah ini terlewat, `db:generate` akan bilang **"No schema changes"** padahal file schema-nya jelas ada. Tidak ada error, tabelnya cuma diabaikan.

### 3. Definisikan relasi (opsional, untuk `db.query`)

Hanya perlu kalau ingin memakai relational query API. `src/db/schema/relations.ts`:

```ts
import { relations } from "drizzle-orm";
import { users } from "./users";
import { posts } from "./posts";

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));
```

Jangan lupa `export * from "./relations";` di barrel. Setelah itu:

```ts
const withPosts = await db.query.users.findMany({ with: { posts: true } });
```

`relations()` murni konstruksi TypeScript — tidak menghasilkan SQL apa pun. Foreign key yang sebenarnya datang dari `.references()` di tahap 1.

### 4. Generate, baca, terapkan

```bash
npm run db:generate
cat drizzle/0001_*.sql    # WAJIB dibaca sebelum lanjut
npm run db:migrate
```

**Selalu baca file SQL sebelum `migrate`.** Yang perlu dicurigai:
- `DROP COLUMN` / `DROP TABLE` yang tidak Anda maksudkan
- Rename yang terdeteksi sebagai drop + create (datanya hilang)
- Kolom camelCase nyempil — tandanya argumen nama kolom terlewat

Kalau SQL-nya salah, **jangan** diedit manual. Perbaiki file schema, hapus file migrasi yang baru dibuat, lalu `db:generate` ulang.

### 5. Commit

Yang ikut masuk git: file schema, `drizzle/000X_*.sql`, dan `drizzle/meta/`. Migrasi dan snapshot-nya harus berjalan satu paket — kalau `meta/` tertinggal, `generate` berikutnya (di mesin siapa pun) akan menghasilkan diff yang salah.

### Kasus khusus: menambah kolom `NOT NULL` ke tabel berisi data

Postgres menolaknya kalau tidak ada nilai untuk baris yang sudah ada. Dua pilihan:

```ts
role: varchar({ length: 50 }).notNull().default("user")   // beri default
role: varchar({ length: 50 })                             // atau nullable dulu
```

Untuk kolom nullable yang nantinya ingin dijadikan `NOT NULL`: tambahkan sebagai nullable → isi datanya → baru ubah jadi `NOT NULL` di migrasi terpisah.

---

## Troubleshooting

| Gejala | Penyebab & solusi |
|---|---|
| `db:generate` bilang "No schema changes" padahal ada tabel baru | Tabel belum di-`export` dari `src/db/schema/index.ts` |
| `ECONNREFUSED 127.0.0.1:5432` | Postgres tidak jalan atau `DATABASE_URL` salah. Uji: `psql "$DATABASE_URL" -c "SELECT 1"` |
| `password authentication failed` | Password salah, atau karakter spesial belum di-URL-encode |
| `DATABASE_URL is undefined` saat `db:*` | `loadEnvConfig` belum dipanggil, atau dipanggil setelah `defineConfig` |
| `too many clients already` setelah beberapa kali save | Pola `globalThis` di `src/db/index.ts` hilang |
| Kolom bernama `"createdAt"` bukan `created_at` | Argumen nama kolom terlewat: `timestamp("created_at")` |
| Garis merah pada suatu key di `drizzle.config.ts` | Key tidak ada di tipe `Config`. Cek daftar sahnya di `node_modules/drizzle-kit/index.d.mts` (cari `type Config = {`) — lebih akurat daripada artikel internet yang mungkin menulis untuk versi lain |
| `relation "users" already exists` saat `db:migrate` | `db:push` pernah dijalankan di database yang sama. Jangan dicampur |
| `db:generate` mau membuat ulang tabel yang sudah ada | `drizzle/meta/` terhapus. Kalau data belum penting: drop database, hapus folder `drizzle/`, generate dari nol |
| Data hilang setelah ganti schema | Wajar untuk `db:push` — perintah itu memang boleh membuang kolom/tabel demi menyamakan struktur |
| Halaman menampilkan data basi di produksi | `export const dynamic = "force-dynamic"` belum ada. Cek output build: harus `ƒ`, bukan `○` |
| `Module not found: 'pg-native'` saat build | Tambahkan `serverExternalPackages: ["pg"]` ke `next.config.ts` |

---

## Utang teknis yang perlu dibereskan

Arah lanjutan yang belum dikerjakan: `drizzle-zod` untuk memvalidasi input Server Action dari definisi tabel. Data awal user: `npm run db:seed` (`src/db/seed.ts`).

Query halaman **jangan** ditaruh di `src/db/queries/`. Pola yang berlaku: `src/app/<feature>/queries.ts` dengan `import "server-only"`, dipanggil dari `page.tsx`. Referensi: `src/app/users/`.
