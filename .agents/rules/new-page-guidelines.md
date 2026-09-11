---
title: Checklist membuat halaman data-table + CRUD baru
description: Urutan kerja reusable untuk resource baru (schema → migrasi → queries/actions → UI → verifikasi), plus trap yang sudah ditemukan.
globs:
  - src/app/**
  - src/db/schema/**
  - src/lib/validations/**
  - src/db/seed.ts
  - src/components/app-sidebar.tsx
---

# Checklist halaman data-table + CRUD baru

Dokumen ini adalah **checklist umum & reusable** untuk membuat resource baru (tabel database + halaman list + CRUD), disarikan dari proses membangun Users / Countries / Provinces / Cities.

Struktur penjelasan mengikuti [new-pages-pattern.md](../../docs/legacy/new-pages-pattern.md) (urutan kerja + trap + referensi kanonik). **Implementasi di repo ini adalah Next.js 16 + Drizzle + PostgreSQL**, bukan Laravel/Inertia — jangan copy Artisan, Wayfinder, Policy, atau Pest.

Untuk **empat varian UI** create/edit/view (Halaman baru, Dialog, Sheet, Panel inline), kontrak form, dan mode view: lihat [crud-pattern.md](./crud-pattern.md). Dokumen ini **tidak menduplikasi** isi itu — hanya urutan kerja + penjelasan tiap langkah + trap. **Selalu tanya dulu** keempat opsi sebelum scaffold create/edit/view.

Setup data layer (Pool, `drizzle.config.ts`, cara `generate`/`migrate`): [drizzle-setup.md](./drizzle-setup.md). Tata folder: [structure-folder-codebase.md](./structure-folder-codebase.md).

---

## Urutan kerja

Kerjakan berurutan. Jangan mulai UI sebelum schema ter-export dan migrasi sudah dibaca.

### 0. Tanya varian UI

Tawarkan empat opsi di [crud-pattern.md](./crud-pattern.md). Jangan mulai `new/`, `[id]/`, Dialog, Sheet, atau panel sampai ada jawaban — kecuali user sudah memilih di permintaan yang sama.

Delete selalu `AlertDialog` di list, terlepas dari pilihan itu.

### 1. Schema tabel

Buat `src/db/schema/{table}.ts`. Ikuti gaya [`users.ts`](../../src/db/schema/users.ts) / [`cities.ts`](../../src/db/schema/cities.ts):

```ts
import { sql } from "drizzle-orm"
import { pgTable, uniqueIndex, varchar } from "drizzle-orm/pg-core"

import { auditColumns, identityColumns } from "./columns"

export const items = pgTable(
  "items",
  {
    ...identityColumns(), // internalId (integer PK) + id (uuid v7, publik)
    name: varchar({ length: 255 }).notNull(),
    ...auditColumns(), // created/updated/deleted _at + _by
  },
  (table) => [
    uniqueIndex("items_name_unique").on(table.name).where(sql`${table.deletedAt} is null`),
  ],
)

export type Item = typeof items.$inferSelect
export type NewItem = typeof items.$inferInsert
```

**Kenapa begini:** `$inferSelect` / `$inferInsert` adalah satu sumber kebenaran. Jangan tulis `interface Item` di `src/types/` — dua definisi bisa menyimpang diam-diam.

Nama kolom ditulis **manual**, bukan lewat opsi `casing`:

- Properti satu kata boleh tanpa argumen (`name`, `id`).
- Properti multi-kata **wajib** argumen snake_case: `createdAt: timestamp("created_at")`. Tanpa itu kolom Postgres jadi `"createdAt"` dan harus selalu dikutip di SQL.

FK ke tabel lain: `uuid("author_id").references(() => users.id, { onDelete: "cascade" })` — arrow function mencegah import melingkar. `onDelete` harus disengaja (`cascade` / `restrict` / `set null`). Properti `id` di project ini adalah **uuid v7** (kolom `uuid`); `internalId` (integer) hanya untuk tie-breaker sort — jangan dipakai di URL/FK/action.

Setiap fungsi `queries.ts` dan server action **wajib** diawali `await requireUser()` ([src/lib/session.ts](../../src/lib/session.ts)); soft delete = `set({ deletedAt, deletedBy })` dan setiap query memfilter `isNull(table.deletedAt)`.

### 2. Export dari barrel — paling sering terlupa

Tambah `export * from "./{table}"` di [`src/db/schema/index.ts`](../../src/db/schema/index.ts).

`drizzle.config.ts` menunjuk barrel itu. Kalau langkah ini terlewat, `npm run db:generate` bilang **"No schema changes"** padahal file schema sudah ada — tabelnya diabaikan tanpa error.

### 3. Generate migrasi, baca SQL, migrate

```bash
npm run db:generate
# baca file drizzle/000X_*.sql — WAJIB sebelum lanjut
npm run db:migrate
```

**Kenapa tidak `db:push`:** `push` mengubah database langsung tanpa file SQL. Dicampur dengan `generate`/`migrate` di DB yang sama → `relation "…" already exists`. `push` hanya untuk eksperimen di database terpisah.

Yang dicurigai di SQL: `DROP TABLE` / `DROP COLUMN` yang tidak dimaksud, rename yang jadi drop+create, kolom camelCase (argumen nama terlewat). SQL salah → **jangan** edit file migrasi; perbaiki schema, hapus file migrasi baru + snapshot `meta` yang baru, `db:generate` ulang.

Commit schema + `drizzle/000X_*.sql` + `drizzle/meta/` **satu paket**. `meta/` terhapus → `generate` berikutnya menghasilkan diff rusak.

### 4. Validasi Zod

Buat `src/lib/validations/{feature}.ts` — dipakai create dan edit. Normalisasi mentah (`trim`, `toUpperCase` kode) di `actions.ts` **sebelum** `safeParse`, supaya pesan error mencerminkan nilai final.

```ts
export const itemFormSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(255, "Nama maksimal 255 karakter"),
})
```

### 5. Tipe, utils, queries, actions

Di `src/app/{feature}/`:

| File | Peran |
|------|--------|
| `types/index.ts` | `Pick<NewItem, …>`, `{Feature}ActionState`, `{Feature}ListParams` |
| `utils/index.ts` | `PAGE_SIZE`, `parse{Feature}ListParams`, `build{Feature}Href` |
| `queries.ts` | `import "server-only"` — `listX`, `getXById` (`React.cache()` jika ada halaman `[id]`) |
| `actions.ts` | `"use server"` — `create` / `update` / `delete` |

Page **tidak** menulis `db.select()` inline. Query di-`Promise.all` jika list + count independen.

`{Feature}ActionState` di-prefix nama fitur supaya tidak tabrakan saat fitur kedua di-copy.

Sukses mutasi:

- **Halaman baru:** `revalidatePath` lalu `redirect()` — **di luar** `try` (`redirect` throw internal).
- **Dialog / Sheet / Panel inline:** `revalidatePath` + `{ ok: true }` — **tanpa** `redirect()`. Client menutup overlay/panel.

Unique clash: `isUniqueViolation(error)` → field/form error, bukan 500.

### 6. Halaman React

`src/app/{feature}/` — duplikasi folder kanonik yang **sudah dipilih**, jangan campur.

- **Halaman baru** → copy [`src/app/users/`](../../src/app/users/) (`new/`, `[id]/`, `[id]/edit`, `[id]/not-found.tsx`).
- **Dialog** → copy [`src/app/countries/`](../../src/app/countries/) (tanpa `new/` / `[id]/`).
- **Sheet** → copy [`src/app/menus/`](../../src/app/menus/). Jangan ubah `src/components/ui/sheet.tsx`.
- **Panel inline** → copy [`src/app/parameters/`](../../src/app/parameters/) (`{feature}-side-panel.tsx` + `{feature}-sheets.tsx`). Bukan Sheet.

Setiap page: `metadata` / `generateMetadata`, `export const dynamic = "force-dynamic"`, `PageProps<"/{feature}">` (tipe ini hanya ada setelah `next dev` atau `next build`).

Wajib `loading.tsx` (Skeleton) dan `error.tsx` (prop `retry`, bukan `reset` — Next.js 16).

Semua copy UI bahasa Inggris (label, placeholder, toast, pesan zod, error dari action). Label nav/breadcrumb = nama fitur (cocok sidebar).

### 7. Nav

Sidebar dirender dari tabel `menus`: tambah baris lewat `/menus` (dan di [`src/db/seed.ts`](../../src/db/seed.ts) supaya ikut di environment baru) dengan `routeName: "/{feature}"` dan `icon` = nama ikon lucide-react. Nama ikon baru harus didaftarkan di peta `ICONS` [`src/components/app-sidebar.tsx`](../../src/components/app-sidebar.tsx) (tidak dikenal → `CircleIcon`). Di project ini tidak ada `app-header.tsx` terpisah seperti Laravel.

### 8. Seed (opsional)

Kalau list butuh data contoh: tambah array + `insert … onConflictDoNothing` di [`src/db/seed.ts`](../../src/db/seed.ts), lalu `npm run db:seed`. Jangan mengandalkan `db:push` untuk isi data.

### 9. Finishing

```bash
npx tsc --noEmit
npm run lint
npm run build    # rute DB harus ƒ, bukan ○
```

Tidak ada test runner di repo ini — jangan mengasumsikan `npm test` atau Pest. Verifikasi HTTP: `GET /{feature}` 200; untuk Dialog/Sheet/panel, `GET /{feature}/new` dan `GET /{feature}/{uuid}` harus 404.

Kalau UI berubah: buka halaman, exercise create/view/edit/delete, pastikan state konsisten. Panel inline: list menyusut, breadcrumb tetap penuh, klik luar tidak menutup.

---

## Trap yang sudah ditemukan

- **Barrel schema terlupa:** `db:generate` → "No schema changes". Cek `export *` di `src/db/schema/index.ts`.
- **Kolom `"createdAt"` di Postgres:** argumen `timestamp("created_at")` terlewat. Selalu baca SQL hasil generate.
- **`db:push` lalu `db:migrate` di DB yang sama:** `relation already exists`. Jangan dicampur.
- **Halaman data basi di produksi:** lupa `export const dynamic = "force-dynamic"`. Gejala: build sukses, data tidak pernah berubah. Cek output build = `ƒ`.
- **`PageProps<"/foo">` merah:** tipe rute belum digenerate. Jalankan `next dev` atau `next build`, jangan tulis tangan `params` / `searchParams`.
- **Server Component mengimpor table/search/pagination lalu melewatkannya sebagai prop ke Client workspace:** plugin TypeScript Next.js sering menandai `Cannot find module`. Client workspace yang mengimpor komponen itu; page hanya mengirim data serializable (`q`, `page`, `rows`, …).
- **`Button` + `Link`:** Base UI `Button` default `nativeButton={true}`. Render `<a>` tanpa `nativeButton={false}` → warning semantik. `<Button disabled render={<Link/>}>` jadi `<a disabled>` yang diabaikan browser — pakai `<button disabled>` polos (lihat `user-pagination.tsx`).
- **`redirect()` di dalam `try`:** tertangkap sebagai error. Panggil di luar `try` setelah insert/update berhasil.
- **`redirect()` pada Dialog/Sheet/panel:** overlay tidak sempat menutup dengan rapi; pakai `{ ok: true }`.
- **Boolean `Switch`/`Checkbox` di FormData:** field unchecked **tidak terkirim**. Pola aman: `useState` + `<input type="hidden" name="…" value={on ? "1" : "0"} />` supaya nilai selalu eksplisit. (Sama seperti trap form native di [new-pages-pattern.md](../../docs/legacy/new-pages-pattern.md).)
- **Field kompleks (JSON, color picker, …):** boleh ditunda dari UI iterasi pertama selama kolom sudah ada di schema/migrasi — jangan silently drop dari tabel. Catat TODO kalau relevan.
- **Mengubah `src/components/ui/sheet.tsx` untuk panel inline:** dilarang. Buat `{feature}-side-panel.tsx` lokal.
- **`useMemo` / `useCallback` / `memo` untuk performa:** React Compiler sudah nyala (`reactCompiler: true`). Jangan ditambah tangan.
- **Hot reload bocor koneksi Postgres:** jangan hapus pola `globalThis` di `src/db/index.ts`.
- **Tidak ada test runner:** jangan scaffold `*.test.ts` atau mengasumsikan Pest/Vitest sampai runner dipasang.

---

## Referensi contoh kanonik

| Varian | Folder | Catatan |
|--------|--------|---------|
| Halaman baru | [`src/app/users/`](../../src/app/users/) | `redirect()` on success; `getUserById` + `React.cache()` |
| Dialog | [`src/app/countries/`](../../src/app/countries/) | Satu page; `{ ok: true }` |
| Sheet | [`src/app/menus/`](../../src/app/menus/) | Overlay memblokir list |
| Panel inline | [`src/app/parameters/`](../../src/app/parameters/) | List menyusut; bukan Sheet |

UX keempat opsi (Laravel, sebagai penjelasan): [crud-pattern-laravel.md](../../docs/legacy/crud-pattern-laravel.md). Checklist Laravel asli (urutan + trap Eloquent): [new-pages-pattern.md](../../docs/legacy/new-pages-pattern.md).
