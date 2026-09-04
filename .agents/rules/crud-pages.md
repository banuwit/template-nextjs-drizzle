---
title: Halaman list / CRUD
description: Alur baku list terpaginasi plus CRUD. Untuk create/edit/view, tanya dulu — Halaman baru, Dialog, Sheet, atau Panel Inline — jangan mengasumsikan.
globs:
  - src/app/**
  - src/db/schema/**
  - src/lib/validations/**
  - src/components/app-sidebar.tsx
---

# Halaman list / CRUD

Kapan dipakai: menambah atau mengubah halaman list plus CRUD (create, edit, view, delete).

Penjelasan UX keempat opsi (kapan overlay vs halaman, header tertutup atau tidak, klik luar) ada di [crud-pattern-laravel.md](../../crud-pattern-laravel.md) bagian *Create, edit, view — tanya dulu*, *Mode view*, dan *Perbandingan singkat Sheet vs Panel inline*. **Implementasi di repo ini adalah Next.js + Drizzle**, bukan Inertia/Laravel — jangan copy Artisan, Wayfinder, atau Pest.

Urutan kerja langkah demi langkah (schema → migrasi → queries/actions → UI → verifikasi) plus trap: [new-page-guidelines.md](./new-page-guidelines.md).

## Create, edit, view — tanya dulu

Sebelum scaffold `new/`, `[id]/`, Dialog, Sheet, atau panel inline: **tanya user** UI/UX mana yang dipakai.

Pilihan yang harus ditawarkan:

| Opsi | Ringkasan | Contoh kanonik |
|------|-----------|----------------|
| **Halaman baru** | Route + halaman terpisah (`new/`, `[id]/`, `[id]/edit`) | [`src/app/users/`](../../src/app/users/) |
| **Dialog** | Modal di atas list | [`src/app/countries/`](../../src/app/countries/) |
| **Sheet** | Panel `Sheet` (fixed, overlay) dari kanan | [`src/app/provinces/`](../../src/app/provinces/) |
| **Panel inline** | Panel di area konten; list menyusut (2 kolom); header tidak tertutup | [`src/app/cities/`](../../src/app/cities/) |

Aturan:

- Jangan mengasumsikan. Jangan mulai implementasi create/edit/view sampai ada jawaban.
- Lewati pertanyaan hanya jika user sudah menyatakan pilihannya di permintaan yang sama (misalnya “pakai panel inline”).
- Tanya sekali untuk ketiga aksi (create, edit, view). Kalau user ingin campuran (misalnya create Dialog, view halaman), ikuti itu — jangan mencampur tanpa izin.
- Delete tetap `AlertDialog` di list (`{feature}-row-actions.tsx` + `use-delete-{feature}.ts`), terlepas dari pilihan create/edit/view.
- `src/app/examples/` adalah demo TanStack Table read-only — **bukan** konvensi halaman baru. Jangan campur keempat pola di satu fitur.

## Kontrak bersama (semua opsi)

Folder `src/app/<feature>/` — lihat [AGENTS.md](../../AGENTS.md) dan [structure-folder-codebase.md](./structure-folder-codebase.md). Schema + migrasi: [drizzle-setup.md](./drizzle-setup.md).

Wajib:

- `actions.ts` (`"use server"`) menulis; `queries.ts` (`import "server-only"`) membaca. Page tidak menulis query Drizzle inline.
- Tipe form dari schema (`Pick<NewX, ...>`), validasi di `src/lib/validations/<feature>.ts`.
- `useActionState`; prefix `ActionState` dengan nama fitur (`CityActionState`).
- Unique clash → `isUniqueViolation` jadi field/form error, bukan 500.
- `export const dynamic = "force-dynamic"` pada page yang query DB. Build: rute itu `ƒ`, bukan `○`.
- Copy UI bahasa Indonesia; label nav/breadcrumb tetap nama fitur Inggris (cocok sidebar).
- Nama komponen di-prefix fitur (`city-form.tsx`). Page Server Component jangan mengimpor modul yang hanya dipakai sebagai slot ke Client Component — Client workspace yang mengimpor table/search/pagination.
- `loading.tsx` + `error.tsx` (`retry`). Nav: item di [`src/components/app-sidebar.tsx`](../../src/components/app-sidebar.tsx).

## Mode view

Edit hanya dari **kolom aksi di list**, bukan dari tampilan view.

| Pola UI | Di view | Tutup / kembali |
|---------|---------|-----------------|
| **Dialog** | Tanpa `DialogFooter`; tanpa tombol Close atau Edit | X dialog + klik luar overlay |
| **Sheet** | Tanpa `SheetFooter`; tanpa tombol Close atau Edit | X sheet + klik luar overlay (modal) |
| **Panel inline** | Tanpa `{Feature}SidePanelFooter`; tanpa tombol Close atau Edit | X di header panel |
| **Halaman baru** (`[id]/page.tsx`) | Tanpa tombol Edit | **Kembali ke {resources}** di header; tanpa `CardFooter` hanya untuk back |

View = detail (`DetailRow` / `dl`). Create/edit tetap footer form (Batal + submit).

## Pola halaman baru (Users)

Pakai jika user memilih **Halaman baru**.

- Rute: `page.tsx` (list), `new/page.tsx`, `[id]/page.tsx`, `[id]/edit/page.tsx`, `[id]/not-found.tsx`.
- Sukses mutasi: `revalidatePath()` lalu `redirect()` — **di luar** `try`. `getXById` dibungkus `React.cache()` untuk `generateMetadata` + page.
- Nama di table = `Link` ke view. Edit hanya di kolom aksi.
- Jangan pakai Dialog/Sheet/panel untuk create/edit/view.

## Pola dialog (Countries)

Pakai jika user memilih **Dialog**. Jangan buat `new/` atau `[id]/`.

- Satu `page.tsx`. State client `create` / `edit` / `view` / `null`. shadcn `Dialog` wajib `DialogTitle`.
- Colocate: `{feature}-workspace.tsx`, `{feature}-form-dialog.tsx`, `{feature}-view-dialog.tsx`, `{feature}-form.tsx`.
- Sukses: `revalidatePath("/{feature}")` + `{ ok: true }` — **tanpa** `redirect()`. Client menutup dialog.
- Create kosong: tombol header (dan empty state) membuka dialog, bukan `Link` ke `/new`.

## Pola sheet (Provinces)

Pakai jika user memilih **Sheet**. Jangan buat `new/` atau `[id]/`.

- Sama seperti dialog, overlay-nya `Sheet` + `SheetContent` (`side="right"`), wajib `SheetTitle`.
- Sheet **modal** (default): overlay menutupi halaman; panel fixed ke viewport kanan. List di belakang tidak bisa diklik.
- Colocate: `{feature}-form-sheet.tsx`, `{feature}-view-sheet.tsx`, `{feature}-form.tsx`.
- Sukses: `revalidatePath` + `{ ok: true }`, tanpa `redirect()`.
- **Jangan ubah** [`src/components/ui/sheet.tsx`](../../src/components/ui/sheet.tsx) kecuali user minta eksplisit.

## Pola panel inline (Cities)

Pakai jika user memilih **Panel inline**. Jangan buat `new/` atau `[id]/`. **Bukan** Sheet.

- Satu `page.tsx`. State `create` / `view` / `edit` / `closed`.
- Primitif lokal `{feature}-side-panel.tsx` (bukan shared Sheet): `{Feature}SidePanelLayout` membungkus list **dan** panel (`children` + `panel`). Sub: Header, Title, Description, Body, Footer.
- Wrapper `{feature}-sheets.tsx`: satu instance layout; isi panel di-swap menurut mode — **tanpa fade** saat ganti mode. Animasi hanya lebar buka/tutup.
- Panel hanya di `{children}` [`AppLayout`](../../src/components/layout/app-layout.tsx) — **breadcrumb tetap penuh lebar**; list `min-w-0 flex-1` menyusut. Padding di kolom list saja.
- Non-modal: list (cari, pagination, baris lain) tetap bisa diklik. Klik luar **tidak** menutup — hanya X atau Batal.
- Footer `border-t` hanya create/edit. View tanpa footer.
- Sukses: `revalidatePath` + `{ ok: true }`, tanpa `redirect()`.
- **Jangan ubah** `src/components/ui/sheet.tsx`. Jangan portal/`fixed` ke viewport.

### Sheet vs panel inline

| | Sheet (Provinces) | Panel inline (Cities) |
|--|-------------------|------------------------|
| Komponen | `@/components/ui/sheet` | `{feature}-side-panel.tsx` (lokal) |
| Posisi | Fixed portal, overlay viewport | Inline di area konten layout |
| Header app | Tertutup overlay | Tetap penuh lebar |
| Body list | Lebar penuh di belakang | Menyusut (2 kolom) |
| Interaksi list saat terbuka | Diblok overlay | Tetap bisa |
| Tutup dengan klik luar | Ya (modal) | Tidak — hanya tombol eksplisit |

## Jangan

- Mengasumsikan salah satu dari 4 opsi tanpa menanya (kecuali user sudah memilih)
- Membuat `new/` + `[id]/` untuk Dialog, Sheet, atau panel inline — atau sebaliknya
- Memakai Sheet untuk panel inline, atau sebaliknya
- Mengubah `src/components/ui/sheet.tsx` saat implementasi panel inline
- `redirect()` pada sukses Dialog / Sheet / panel inline
- Tombol Edit atau Close di footer view; tombol Edit di halaman `[id]/` (kecuali user minta)
- Query Drizzle di `page.tsx` atau di `src/db/queries/`
