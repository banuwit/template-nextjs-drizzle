---
title: Halaman list / data-table Inertia
description: Alur baku list terpaginasi plus CRUD. Ikuti list Users untuk table. Untuk create/edit/view, tanya dulu — Halaman baru, Dialog, Sheet, atau Panel Inline — jangan mengasumsikan.
globs:
  - app/Http/Controllers/**
  - app/Http/Requests/**
  - app/Policies/**
  - app/Models/**
  - routes/web.php
  - resources/js/pages/**
  - resources/js/components/app-sidebar.tsx
  - resources/js/components/app-header.tsx
  - resources/js/components/content-side-panel.tsx
  - resources/js/types/pagination.ts
  - tests/Feature/**
---

# Halaman list Inertia

Kapan dipakai: menambah atau mengubah halaman list / data-table Inertia, atau CRUD di atas list itu (create, edit, view, delete). Baca rule ini jika path yang akan diedit termasuk glob di atas.

Contoh kanonik list: `UserController`, `IndexUserRequest`, `UserPolicy`, `resources/js/pages/users/index.tsx`, `tests/Feature/UserIndexTest.php`.

Contoh kanonik create/edit/view **halaman baru**: Users (`create.tsx`, `edit.tsx`, `show.tsx`).

Contoh kanonik create/edit/view **dialog**: Countries (`resources/js/pages/countries/index.tsx`, `country-dialogs.tsx`, `country-form.tsx`). Route hanya `index` / `store` / `update` / `destroy`.

Contoh kanonik create/edit/view **sheet** (Radix): Provinces (`resources/js/pages/provinces/index.tsx`, `province-sheets.tsx`, `province-form.tsx`). Route hanya `index` / `store` / `update` / `destroy`.

Contoh kanonik create/edit/view **panel inline**: Cities (`resources/js/pages/cities/index.tsx`, `city-sheets.tsx`, `city-form.tsx`, `@/components/content-side-panel`). Route hanya `index` / `store` / `update` / `destroy`.

Bangun halaman list **secara manual** (controller + Inertia + shadcn `Table`). Jangan memakai Filament, generator CRUD, atau TanStack Table kecuali user memintanya.

## Create, edit, view — tanya dulu

Sebelum scaffold route `create` / `edit` / `show`, halaman React, dialog, sheet, atau panel inline: **tanya user** UI/UX mana yang dipakai.

Pilihan yang harus ditawarkan:

| Opsi | Ringkasan |
|------|-----------|
| **Halaman baru** | Route + halaman terpisah (`create.tsx`, `edit.tsx`, `show.tsx`) — seperti Users |
| **Dialog** | Modal di atas list — seperti Countries |
| **Sheet** | Panel Radix `Sheet` (fixed, overlay) dari kanan — seperti Provinces |
| **Panel inline** | Panel di area konten layout; body menyusut (2 kolom); header tidak tertutup — seperti Cities |

Aturan:

- Jangan mengasumsikan. Jangan mulai implementasi create/edit/view sampai ada jawaban.
- Lewati pertanyaan hanya jika user sudah menyatakan pilihannya di permintaan yang sama (misalnya “pakai panel inline”).
- Tanya sekali untuk ketiga aksi (create, edit, view). Kalau user ingin campuran (misalnya create dialog, view halaman), ikuti itu — jangan mencampur tanpa izin.
- Delete tetap `AlertDialog` di list (lihat `user-delete-button.tsx`, `country-delete-button.tsx`, dll.), terlepas dari pilihan create/edit/view.

## Mode view — aksi di UI

Aturan baku untuk tampilan **view** (read-only). Edit tetap diakses dari **kolom aksi di list**, bukan dari view.

| Pola UI | Di view | Tutup / kembali |
|---------|---------|-----------------|
| **Dialog** | Tanpa `DialogFooter`; **tanpa** tombol Close atau Edit | Tombol X dialog + klik luar overlay |
| **Sheet** | Tanpa `SheetFooter`; **tanpa** tombol Close atau Edit | Tombol X sheet + klik luar overlay (modal) |
| **Panel inline** | Tanpa `ContentSidePanelFooter`; **tanpa** tombol Close atau Edit | Tombol X di `ContentSidePanelHeader` |
| **Halaman baru** (`show.tsx`) | **Tanpa** tombol Edit di halaman show | Tombol **Back to {resources}** di area aksi header (contoh `Back to users` → `usersIndex()`). **Tanpa** `CardFooter` duplikat untuk back |

Contoh kanonik view tanpa footer aksi: `country-dialogs.tsx` (view), `province-sheets.tsx` (view), `city-sheets.tsx` (view). Contoh halaman show: `users/show.tsx`.

- View hanya menampilkan detail (`dl` / `DetailRow` + `Badge` untuk kode/status). Jangan tambah tombol Edit atau Close di footer view kecuali user meminta eksplisit.
- Create dan edit tetap punya footer form (Cancel + submit) seperti biasa.

## Alur list (kerjakan berurutan)

1. **Scaffold** dengan Artisan (`--no-interaction`, `--pest` untuk tes):
   - `php artisan make:controller {Model}Controller`
   - `php artisan make:request {Models}/Index{Model}Request`
   - `php artisan make:policy {Model}Policy --model={Model}`
   - `php artisan make:test --pest {Model}IndexTest`
2. **Route** di dalam group `auth` + `verified` yang sudah ada di `routes/web.php`. Namai `{resources}.index`. Pakai GET ke method `index` controller — jangan `Route::inertia()` jika halaman butuh data dari query string.
3. **Policy** `viewAny` — user yang sudah login boleh melihat list untuk saat ini; perkecil nanti dengan role. Jangan melewati otorisasi.
4. **Form Request** `Index{Model}Request`:
   - `authorize()` mengembalikan `$this->user()?->can('viewAny', {Model}::class) ?? false`
   - Validasi `search` (nullable string max 255), `sort` (hanya `in:` whitelist), `direction` (`in:asc,desc`)
   - Sediakan helper bertipe (`search()`, `sort()`, `direction()`) dengan default yang aman — jangan baca query param yang belum divalidasi di controller
5. **Scope model** `search` (`#[Scope]`) memakai `whereAny` dan `addcslashes($term, '%_\\')` supaya `%` / `_` tidak memperluas LIKE. Lewati constraint jika term kosong.
6. **Controller `index`** tetap listing, bukan service class:
   - `select()` hanya kolom yang dibutuhkan table (jangan password / rahasia)
   - `->search()->orderBy($sort, $direction)->paginate(10)->withQueryString()`
   - `through()` ke array publik (tanggal dalam ISO-8601)
   - `Inertia::render('{resources}/index', ['{resources}' => $paginator, 'filters' => [...]])`
   - Sort default: `created_at` desc
   - Untuk dialog / sheet / panel inline: kirim juga opsi relasi yang dibutuhkan form (mis. `countries`, `provinces`) dari `index` — jangan fetch halaman terpisah.
7. **Halaman React** di `resources/js/pages/{resources}/index.tsx`. App layout otomatis (nama selain `auth/` / `settings/`). Set `Component.layout = { breadcrumbs: [...] }`.
8. **Wayfinder** untuk setiap URL. Import fungsi named route dari `@/routes/{resources}` (atau `@/actions/...`). Setelah menambah route: `php artisan wayfinder:generate --with-form --no-interaction`.
9. **Nav**: tambah item di **kedua** `app-sidebar.tsx` dan `app-header.tsx` memakai href Wayfinder dan ikon Lucide.
10. **Tes** Pest dengan `assertInertia` (lihat di bawah). Lalu Pint, file tes baru, dan lint frontend.

## Pola halaman baru (Users)

Pakai jika user memilih **halaman baru**.

- `Route::resource('{resources}', {Model}Controller::class)` lengkap, termasuk GET `create` / `show` / `edit`.
- Halaman `create.tsx`, `edit.tsx`, `show.tsx` plus form colocation (contoh `user-form.tsx`).
- Index memakai Inertia `Link` + Wayfinder ke create / show / edit. Nama di table mengarah ke show. **Edit hanya di kolom aksi list** — halaman `show.tsx` tidak menampilkan tombol Edit.
- Halaman `show.tsx`: tombol **Back to {resources}** (`variant="outline"`, `Link` ke `{resources}.index`) di header aksi; ikuti `users/show.tsx`. Jangan `CardFooter` hanya untuk back.
- `store` / `update` / `destroy` redirect `to_route('{resources}.index')` plus `Inertia::flash('toast', ...)`.
- Tes: tamu diblokir di create/show; actor terautentikasi bisa membuka halaman; store/update/destroy; unique/validasi redirect kembali ke form.

## Pola dialog (Countries)

Pakai jika user memilih **dialog**. Jangan membuat `create.tsx` / `edit.tsx` / `show.tsx`.

- `Route::resource(...)->only(['index', 'store', 'update', 'destroy'])`. Jangan daftarkan GET create/edit/show.
- Satu halaman index. State dialog di client (`create` / `edit` / `view` / `closed`). shadcn `Dialog` wajib `DialogTitle`.
- Form: `<Form {...store.form()}>` / `update.form(id)` dengan `options={{ preserveState: true, preserveScroll: true }}`, `onSuccess` menutup dialog. Validasi gagal: dialog tetap terbuka karena `preserveState`.
- View memakai data baris yang sudah di-`through()` (ikutkan `updated_at` jika detail membutuhkannya). Jangan fetch show page. **Tanpa** `DialogFooter` di mode view (lihat bagian *Mode view*).
- Create/Edit kosong: tombol di header dan empty state membuka dialog, bukan `Link` ke route create.
- Tes: `Route::has('{resources}.create|show|edit')` false; store/update dari index; unique/validasi redirect ke index.

## Pola sheet (Provinces)

Pakai jika user memilih **sheet** (Radix). Jangan membuat `create.tsx` / `edit.tsx` / `show.tsx`.

- `Route::resource(...)->only(['index', 'store', 'update', 'destroy'])`. Jangan daftarkan GET create/edit/show.
- Satu halaman index. State sheet di client (`create` / `edit` / `view` / `closed`). shadcn `Sheet` + `SheetContent` (`side="right"`), wajib `SheetTitle`.
- Sheet **modal** (default Radix): overlay menutupi halaman; panel fixed ke viewport kanan. Cocok bila user ingin fokus penuh pada form tanpa interaksi list di belakang.
- Colocate: `{resource}-sheets.tsx`, `{resource}-form.tsx`, `{resource}-delete-button.tsx`.
- Layout panel: header `border-b px-4 py-4 pr-12`, body `p-4`; footer `border-t` **hanya untuk create/edit form**, bukan view — ikuti `province-sheets.tsx`.
- Form: sama seperti dialog (`preserveState`, `preserveScroll`, `onSuccess` menutup sheet).
- View memakai data baris dari `through()`. Tombol View/nama baris membuka sheet view; Edit dari kolom aksi list. **Tanpa** `SheetFooter` di mode view (lihat bagian *Mode view*).
- Nonaktifkan tombol Create jika prerequisite relasi kosong (mis. `disabled={countries.length === 0}`) plus pesan empty state yang jelas.
- **Jangan ubah** `@/components/ui/sheet.tsx` kecuali user meminta secara eksplisit — komponen shadcn shared.
- Tes: sama seperti dialog — tidak ada route create/show/edit; store/update/destroy dari index.

## Pola panel inline (Cities)

Pakai jika user memilih **panel inline**. Jangan membuat `create.tsx` / `edit.tsx` / `show.tsx`.

- `Route::resource(...)->only(['index', 'store', 'update', 'destroy'])`. Jangan daftarkan GET create/edit/show.
- Satu halaman index. State panel di client (`create` / `edit` / `view` / `closed`) — struktur state sama seperti sheet/dialog.
- **Bukan** Radix Sheet. Pakai `@/components/content-side-panel`:
  - `ContentSidePanelLayout` membungkus konten index **dan** panel (terima `children` + prop `panel`).
  - Sub-komponen: `ContentSidePanelHeader`, `ContentSidePanelTitle`, `ContentSidePanelDescription`, `ContentSidePanelBody`, `ContentSidePanelFooter` (footer **hanya** create/edit form, bukan view).
- Panel hanya muncul di area `{children}` layout app (`app-sidebar-layout.tsx`) — **header breadcrumb tidak tertutup**; body list menyusut seperti grid 2 kolom saat panel terbuka.
- Colocate: `{resource}-sheets.tsx` (wrapper layout + konten panel), `{resource}-form.tsx`, `{resource}-delete-button.tsx` — ikuti `city-sheets.tsx` / `cities/index.tsx`.
- Form: sama seperti dialog/sheet (`preserveState`, `preserveScroll`, `onSuccess` menutup panel).
- View memakai data baris dari `through()`. **Tanpa** `ContentSidePanelFooter` di mode view (lihat bagian *Mode view*). Klik di luar panel **tidak** menutup panel (non-modal) — tutup lewat tombol X di header atau Cancel pada form create/edit.
- Animasi buka/tutup panel ada di `ContentSidePanelLayout`; **jangan** tambah fade saat ganti mode (create ↔ edit ↔ view) — konten berganti langsung.
- Nonaktifkan tombol Create jika prerequisite relasi kosong, sama seperti sheet.
- **Jangan ubah** `@/components/ui/sheet.tsx` untuk panel inline — buat/perluas `content-side-panel.tsx` jika perlu.
- Tes: sama seperti dialog — tidak ada route create/show/edit; store/update/destroy dari index.

### Perbandingan singkat Sheet vs Panel inline

| | Sheet (Provinces) | Panel inline (Cities) |
|--|-------------------|------------------------|
| Komponen | `@/components/ui/sheet` | `@/components/content-side-panel` |
| Posisi | Fixed portal, overlay viewport | Inline di area konten layout |
| Header app | Tertutup overlay/panel | Tetap penuh lebar |
| Body list | Lebar penuh di belakang | Menyusut (2 kolom) |
| Interaksi list saat terbuka | Diblok overlay | Tetap bisa (search, pagination, baris lain) |
| Tutup dengan klik luar | Bisa (modal) | Tidak — hanya tombol eksplisit |

## Kontrak table frontend

- Ketik paginator dengan `Paginated<T>` dari `@/types` (`resources/js/types/pagination.ts`). Pakai ulang; jangan menduplikasi bentuknya.
- Props: baris terpaginasi + `filters` (`search`, `sort`, `direction`) supaya UI sesuai query string.
- Susun shadcn: `Card` + `Table` + `Empty` + `InputGroup` + `Badge` + `Button`. Pakai `gap-*`, bukan `space-y-*`. Token semantik, bukan warna mentah.
- Search: state lokal + debounce 300ms lewat `router.get`. Bandingkan `search.trim()` dengan `filters.search` sebelum visit. **Jangan** `setState` secara sinkron di dalam `useEffect` untuk meniru props (eslint `react-hooks/set-state-in-effect`).
- Visit sort/search: `router.get(index.url({ query: {...} }), {}, { preserveState: true, preserveScroll: true, replace: true })`. Hilangkan kunci query default (`search` kosong, `sort=created_at`, `direction=desc`) supaya URL tetap bersih.
- Pagination: Inertia `Link` pada `prev_page_url` / `next_page_url` (juga `preserveState` + `preserveScroll`). `Button` disabled jika URL null. Jangan `<a>` mentah atau shadcn `PaginationLink` (`<a>` memuat ulang penuh).
- Empty: salinan berbeda untuk “belum ada data” vs “tidak ada hasil search”.
- `TableHead` yang bisa di-sort memakai `aria-sort`. Table sudah di-wrap `overflow-x-auto` untuk mobile.

```tsx
router.get(
    index.url({ query: { ...(search !== '' ? { search } : {}) } }),
    {},
    { preserveState: true, preserveScroll: true, replace: true },
);
```

## Tes (minimum)

List: tamu → redirect ke login. Kunjungan terautentikasi → `component('{resources}/index')` plus props baris dan filter default. Search, urutan sort sesuai whitelist, pagination (`per_page` 10), `sort` tidak valid → error session + redirect. Pakai `AssertableInertia as Assert`.

CRUD: ikuti pola tes Users (halaman baru) atau Countries / Provinces / Cities (dialog / sheet / panel inline). Jangan menulis tes halaman `create`/`show`/`edit` jika user memilih dialog, sheet, atau panel inline.

## Jangan

- Mengasumsikan create/edit/view sebagai halaman baru, dialog, sheet, atau panel inline tanpa menanya (kecuali user sudah memilih)
- Path hardcoded (`'/users'`) di React
- `User::paginate()` tanpa `orderBy` / `select` / `through`
- Mempercayai `$request->sort` tanpa whitelist `in:`
- Pola UI list kedua (div-grid, infinite scroll) kecuali user memintanya
- Membuat halaman create/edit/show untuk resource yang user minta sebagai dialog, sheet, atau panel inline — atau sebaliknya
- Memakai Radix Sheet untuk panel inline, atau sebaliknya — ikuti pilihan user dan contoh kanonik masing-masing
- Mengubah `@/components/ui/sheet.tsx` saat implementasi panel inline
- Menambah tombol Edit atau Close di footer/view dialog, sheet, atau panel inline — atau tombol Edit di halaman `show.tsx` (kecuali user meminta eksplisit)
