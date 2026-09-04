---
title: Memilih dan memakai komponen filter (FacetedFilter vs SelectBox)
description: Langkah wajib bertanya ke user sebelum membangun filter atau select - komponen mana, single/multi/search, tampilan option seperti apa. Plus template kode dan cara membaca nilainya di server.
globs:
  - src/components/filters/**
  - src/components/data-grid/**
  - src/components/data-table/**
  - src/app/**
---

# Memilih dan memakai komponen filter

Kapan dipakai: setiap kali butuh kontrol pilihan — filter di toolbar tabel, select di form, filter di card atau halaman.

Semua ada di `@/components/filters` dan **tidak terikat tabel**. Jangan pernah membuat popover multi-select, dropdown pilihan, atau combobox baru — pakai yang sudah ada.

Placeholder sama dengan `crud-pattern.md`: `{Feature}` (PascalCase), `{feature}` (kebab singular), `{features}` (kebab plural = segmen route). Dokumen ini **mandiri** — tidak bergantung pada fitur contoh mana pun di codebase.

Keduanya Client Component. Halaman yang merendernya harus `"use client"`, atau merendernya dari komponen workspace yang `"use client"`.

---

## Langkah 0 — tanya user tiga hal (WAJIB)

### 1. Komponen mana?

Perbedaan intinya adalah **kapan pilihan berlaku**:

|                        | `FacetedFilter`                                                       | `SelectBox`                                                                  |
| ---------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Berlakunya             | Ditunda — ada tombol **Apply** dan **Reset**                          | **Langsung** saat item diklik, tanpa Apply                                   |
| Trigger menampilkan    | Judul + badge jumlah terpilih                                         | Label terpilih (single) atau chip (multi)                                    |
| Cocok untuk            | Filter tabel, terutama server-side yang tiap perubahan memicu request | Form control, filter yang murah, select di card atau halaman                 |
| Bisa jadi form control | Tidak                                                                 | Ya — prop `name` merender hidden input                                       |
| Tampilan option        | Label + ikon                                                          | Label + ikon / emoji / dot warna / avatar / badge / deskripsi, plus grouping |

Aturan praktis:

- **Filter di toolbar tabel yang memicu navigasi server** → `FacetedFilter`. Apply mencegah satu navigasi per centang.
- **Select di form** → `SelectBox` dengan `name`.
- **Filter client-side yang murah, atau select di card/halaman** → `SelectBox`.

Kalau user ragu, tanyakan: *"filternya langsung berlaku saat diklik, atau ada tombol Apply dulu?"* — jawabannya menentukan komponennya.

### 2. Satu pilihan, banyak pilihan, atau perlu search?

| Kebutuhan        | `SelectBox`               | `FacetedFilter`             |
| ---------------- | ------------------------- | --------------------------- |
| Single select    | default (`mode="single"`) | `variant="single"`          |
| Multi select     | `mode="multi"`            | `variant="multi"` (default) |
| Ada kotak search | `searchable`              | selalu ada                  |

### 3. Option-nya perlu tampil seperti apa?

Khusus `SelectBox`, semuanya lewat data — **jangan** bikin komponen baru per gaya:

| Kebutuhan                       | Field di `SelectOption`                         |
| ------------------------------- | ----------------------------------------------- |
| Ikon Lucide                     | `icon`                                          |
| Bendera / emoji                 | `emoji`                                         |
| Titik warna status              | `color` (kelas Tailwind, mis. `bg-emerald-500`) |
| Avatar user                     | `avatar: { src?, fallback }`                    |
| Badge di kanan                  | `badge: { label, variant? }`                    |
| Baris keterangan di bawah label | `description`                                   |
| Pengelompokan + pemisah         | `group`                                         |
| Option non-aktif                | `disabled`                                      |
| Kata kunci tambahan buat search | `keywords`                                      |

`SelectOption` adalah **superset** `FilterOption` (`label`, `value`, `icon?`), jadi satu daftar option bisa dipakai di kedua komponen. Sebaliknya tidak berlaku: adornment hanya dirender `SelectBox`.

---

## Template

### Filter di toolbar tabel

Tidak dirender langsung — cukup deklarasikan di `toolbar.facets`, dan `data-grid` / `data-table` yang merendernya sebagai `FacetedFilter`:

```tsx
<DataTableServer
  columns={columns}
  paginated={paginated}
  filters={filters}
  url="/{features}"
  toolbar={{
    searches: [{ key: "search", placeholder: "Cari {features}…" }],
    facets: [
      {
        key: "status",
        title: "Status",
        options: [
          { value: "active", label: "Aktif" },
          { value: "inactive", label: "Nonaktif" },
        ],
      },
    ],
  }}
/>
```

`key` facet jadi nama query param. Lihat **Membaca nilainya di server** di bawah.

### Filter satu-pilihan di toolbar tabel

Kalau filternya cuma boleh satu nilai dan harus langsung berlaku begitu diklik (tanpa Apply), pakai `toolbar.selects` — **`DataGridServer` saja**; `DataGridClient`, `DataTableClient`, dan `DataTableServer` tidak menerima field ini:

```tsx
<DataGridServer
  columns={columns}
  paginated={paginated}
  filters={filters}
  url="/{features}"
  toolbar={{
    selects: [
      {
        key: "status",
        placeholder: "Status",
        options: [
          { value: "active", label: "Aktif" },
          { value: "inactive", label: "Nonaktif" },
        ],
        clearable: true,
      },
    ],
  }}
/>
```

`DataGridServer` merender tiap entri `selects` sebagai `SelectBox` mode single, lalu tetap mengirim nilainya lewat query param yang sama seperti `facets`. Jadi query yang sudah menangani facet **tidak perlu diubah** saat sebuah facet multi-pilihan diturunkan jadi single-pick di UI — cukup pindahkan definisinya dari `toolbar.facets` ke `toolbar.selects`.

Field `SelectConfig`: `key`, `placeholder?`, `options` (`SelectOption[]`), `clearable?`.

### SelectBox sebagai form control

```tsx
"use client"

import { SelectBox } from "@/components/filters/select-box"

<SelectBox
  name="parent_id"
  options={parents}
  value={parentId}
  onValueChange={setParentId}
  invalid={!!state.errors?.parent_id}
  clearable
  searchable
  placeholder="Pilih induk"
/>
```

Prop `name` merender hidden input supaya nilainya ikut terkirim lewat `FormData` ke Server Action — single jadi `name`, multi jadi satu input per nilai dengan nama `name[]`.

Di Server Action, baca multi-value dengan `formData.getAll("name[]")`, bukan `formData.get()`:

```ts
const parentId = String(formData.get("parent_id") ?? "")   // single
const tagIds = formData.getAll("tags[]").map(String)        // multi
```

Perhatikan bedanya saat tidak ada yang dipilih:

| Mode     | Hidden input                     | Kosong berarti                                   |
| -------- | -------------------------------- | ------------------------------------------------ |
| `single` | selalu ada, `name="{name}"`      | field **terkirim sebagai string kosong** (`""`)  |
| `multi`  | satu input per nilai, `name[]`   | **tidak ada input sama sekali** → `getAll` = `[]` |

Jadi untuk single, cek string kosong (`value === ""`), bukan absennya field. Ini beda dari `Switch` / `Checkbox` native yang memang tidak terkirim saat tidak dicentang.

### SelectBox multi dengan option kaya

```tsx
import type { SelectOption } from "@/components/filters/types"

const statuses: SelectOption[] = [
  { value: "active", label: "Aktif", color: "bg-emerald-500", group: "Aktif" },
  {
    value: "trial",
    label: "Trial",
    color: "bg-amber-500",
    group: "Aktif",
    description: "Berakhir dalam 14 hari",
  },
  {
    value: "banned",
    label: "Diblokir",
    color: "bg-red-500",
    group: "Nonaktif",
    badge: { label: "Admin", variant: "destructive" },
  },
]

<SelectBox
  mode="multi"
  searchable
  options={statuses}
  value={selected}
  onValueChange={setSelected}
  maxChips={2}
/>
```

### FacetedFilter dipakai lepas dari tabel

```tsx
<FacetedFilter
  title="Status"
  options={options}
  appliedValues={applied}
  onApply={setApplied}
  onClear={() => setApplied([])}
/>
```

Mode lain: `value` / `onValueChange` untuk controlled sederhana. Untuk option yang diambil dari server tersedia `onOpenChange` (lazy load), `isLoading`, `isError`, `onSearchChange` (search didelegasikan ke pemanggil), serta `onLoadMore` / `hasMore` / `isFetchingMore` (infinite scroll).

---

## Membaca nilainya di server

Ini bagian yang paling gampang salah, dan bentuknya beda dari framework berbasis form-encoded.

Facet dan select mengirim nilai sebagai **query param berulang** — `?status=active&status=trial` — bukan `status[]=…`. `searchParams` di Server Component mengembalikannya sebagai:

- `string` kalau hanya satu nilai terpilih
- `string[]` kalau lebih dari satu
- `undefined` kalau tidak ada

Jadi **selalu normalisasi** sebelum dipakai query:

```ts
function toArray(value: string | string[] | undefined): string[] {
  if (value === undefined) return []

  return Array.isArray(value) ? value : [value]
}
```

Lalu di `queries.ts`, gabungkan dengan `inArray` (atau `or` untuk pencocokan non-eksak), dan **whitelist nilainya** — jangan percaya isi query string:

```ts
const VALID_STATUSES = ["active", "inactive"] as const

const statuses = toArray(searchParams.status).filter(
  (s): s is (typeof VALID_STATUSES)[number] =>
    VALID_STATUSES.includes(s as never)
)

const clauses: SQL[] = []

if (statuses.length > 0) {
  clauses.push(inArray({table}.status, statuses))
}

const where = clauses.length > 0 ? and(...clauses) : undefined
```

Facet yang nilainya tidak dikenali harus **diabaikan**, bukan menghasilkan query kosong atau error.

---

## Trap yang sudah ditemukan

- **Jangan kirim `value` dan `appliedValues` bersamaan ke `FacetedFilter`.** `appliedValues` menang. Pilih satu mode: `value` + `onValueChange` (controlled) **atau** `appliedValues` + `onApply` + `onClear` (apply mode).

- **`SelectBox` mode multi tidak menutup popover** setiap kali memilih (`keepOpenOnSelect`, default `true` untuk multi); mode single menutup otomatis. Jangan tambahkan tombol "Selesai" — itu mengubahnya jadi `FacetedFilter`.

- **Search `SelectBox` mencocokkan label, `value`, dan `keywords`.** Kalau `value`-nya id numerik, isi `keywords` supaya bisa dicari dengan kata yang manusiawi.

- **Jangan pakai `ui/select.tsx` untuk multi-select atau select ber-search** — primitive itu tidak mendukung keduanya. Itu alasan `SelectBox` dibangun di atas Popover + Command.

- **Trigger `SelectBox` default `w-full`** (cocok untuk form control yang mau selebar field-nya). Begitu dipakai sebagai filter toolbar di sebelah `FacetedFilter` (yang triggernya shrink-to-fit), `w-full` bikin dia melar memenuhi sisa baris. `DataGridServer` sudah menambahkan `className="w-auto"` di setiap `SelectBox` yang dirender dari `toolbar.selects`; kalau merender `SelectBox` sebagai filter toolbar secara manual, tambahkan `className="w-auto"` yang sama.

- **Warna trigger `SelectBox` sengaja disamakan dengan `FacetedFilter`.** Placeholder, label terpilih, dan chevron semuanya warna teks penuh (bukan `text-muted-foreground`) — persis seperti judul dan chevron `FacetedFilter` yang tidak pernah redup. Jangan kembalikan `text-muted-foreground` dengan alasan "biar kayak native select" — itu perubahan yang disengaja.

- **Icon clear (×) `SelectBox` warnanya `text-destructive`**, tanpa hover background — konsisten dengan elemen destructive lain di project.

- **`selects` hanya ada di `DataGridServer`.** Mengirimnya ke paket lain tidak merender apa pun; tipenya bahkan tidak menerima field itu. Kalau butuh single-pick di `data-table`, pakai `facets` dengan `variant: "single"`.

- **Facet mengubah halaman.** Setiap apply harus mereset `page` ke 1, kalau tidak user bisa terdampar di halaman 3 dari hasil yang cuma punya 1 halaman. Komponen tabel sudah melakukan ini untuk facet yang dideklarasikan lewat `toolbar`; kalau merender `FacetedFilter` manual, reset `page` sendiri.

- **Base UI, bukan Radix.** Trigger memakai `render={<Button/>}`, bukan `asChild`. CSS var lebar anchor adalah `--anchor-width`, bukan `--radix-popover-trigger-width`.

- **Keduanya Client Component.** Merendernya langsung dari Server Component akan gagal — dan `options` yang berisi `icon` (komponen React) tidak bisa dioper melintasi boundary. Bangun daftar option di dalam Client Component; kalau option-nya datang dari DB, oper data polosnya (`{ value, label }`) dari page lalu tambahkan `icon` di client.
