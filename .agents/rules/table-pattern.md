---
title: Memilih dan memakai komponen tabel (data-grid vs data-table)
description: Langkah wajib bertanya ke user sebelum membangun tabel - paket mana, header seperti apa, pagination seperti apa, filter apa, kolom actions seperti apa. Plus template kode untuk tiap kombinasi.
globs:
  - src/components/data-grid/**
  - src/components/data-table/**
  - src/app/**
---

# Memilih dan memakai komponen tabel

Kapan dipakai: setiap kali membangun atau mengubah tampilan tabel/list di halaman.

Project ini punya **dua** paket tabel yang sengaja hidup berdampingan. Keduanya punya API yang sebentuk (client + server, toolbar, pagination), tapi fondasinya beda. Jangan asumsikan salah satunya — **tanya user**.

Untuk urutan scaffold data layer (schema → migrasi → queries → actions → halaman) dan empat pola create/edit/view, lihat `crud-pattern.md`. Dokumen ini hanya soal lapisan tabelnya.

Placeholder sama dengan `crud-pattern.md`: `{Feature}` (PascalCase), `{feature}` (kebab singular), `{features}` (kebab plural = segmen route). Dokumen ini **mandiri** — tidak bergantung pada fitur contoh mana pun di codebase.

---

## Aturan nomor satu: definisi kolom di Client Component

Sebelum apa pun. `cell`, `header`, dan `rowKey` adalah **fungsi**, dan React tidak mengizinkan fungsi dioper dari Server Component ke Client Component. Server Component yang mendefinisikan kolom lalu merender tabel akan gagal saat runtime:

> Functions cannot be passed directly to Client Components

Susunannya **selalu** tiga lapis:

```
page.tsx                     Server Component — query DB, oper data serializable
└── {feature}-workspace.tsx  "use client" — pegang definisi kolom
    └── <DataTableServer />  komponen generik
```

Ini konsekuensi App Router yang tidak ada di framework berbasis Inertia/SPA. Detailnya di `crud-pattern.md` bagian C.1.

---

## Langkah 0 — tanya user lima hal (WAJIB)

Sebelum menulis satu baris kode tabel, tanyakan kelimanya sekaligus. Lewati pertanyaan **hanya** kalau user sudah menyatakannya di permintaan yang sama.

### 1. Paket mana?

| Opsi           | Fondasi                        | Pakai kalau                                                                                                       |
| -------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| **data-grid**  | TanStack Table v9              | Butuh column visibility toggle, header dropdown, pin kolom (sticky), atau reorder kolom.                             |
| **data-table** | Primitive shadcn `Table` murni | List biasa. Tidak menyeret TanStack, bundle lebih kecil, sel lebih gampang dikustomisasi, kode lebih mudah dibaca.   |

Kalau user tidak punya preferensi kuat, **sarankan `data-table`** — lebih sederhana untuk mayoritas halaman list. Naikkan ke `data-grid` hanya kalau salah satu fitur khas TanStack di atas benar-benar dibutuhkan.

### 2. Header seperti apa?

| Opsi                                          | data-grid                                                    | data-table                                                                         |
| --------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| **Label saja** (tidak bisa disort)            | `DataGridHeader`                                             | `DataTableHeader`                                                                  |
| **Header sort** (klik langsung membalik arah) | `DataGridHeaderSort`                                         | `DataTableHeaderSort`                                                              |
| **Header dropdown** (menu Asc/Desc eksplisit) | `DataGridHeaderDropdown` (+ submenu toggle visibility kolom) | `DataTableHeaderDropdown` (sort saja — `data-table` tidak punya visibility toggle) |

Kolom dianggap **Label saja** kalau `sortable` tidak diset. Kolom sortable memilih antara **Header sort** (default) dan **Header dropdown**:

- `data-grid`: pilih dengan memanggil komponen berbeda di `header: ({ column }) => …` pada definisi kolom.
- `data-table`: pilih lewat field `headerVariant` di `DataTableColumn` (`"sort"` default, atau `"dropdown"`), atau tetapkan default satu halaman lewat prop `headerVariant` di `DataTableClient` / `DataTableServer` (kolom yang set sendiri tetap menang):

  ```tsx
  const columns: DataTableColumn<{Feature}>[] = [
    { key: "name", header: "Nama", sortable: true, headerVariant: "dropdown", cell: (row) => row.name },
    { key: "email", header: "Email", sortable: true, cell: (row) => row.email }, // pakai default halaman
  ]

  <DataTableServer columns={columns} paginated={paginated} filters={filters} headerVariant="sort" />
  ```

Boleh dicampur dalam satu baris header: kolom `actions` dan kolom status biasanya label saja, kolom teks/tanggal pakai sort atau dropdown.

Submenu visibility kolom di dalam **Header dropdown** (`data-grid` saja) bisa dimatikan tanpa mengedit tiap kolom — lewat prop halaman:

```tsx
<DataGridServer columns={columns} paginated={paginated} filters={filters} showHeaderVisibilityToggle={false} />
```

`DataGridHeaderDropdown` juga menerima `showVisibilityToggle` sendiri per kolom (menang atas nilai halaman) untuk kasus campuran.

#### Pin & reorder kolom (`data-grid` saja, opt-in)

`DataGridHeaderDropdown` bisa menambah empat item lagi — **Pin to left**, **Pin to right**, **Move to left**, **Move to right** — plus **Unpin** saat kolomnya sedang di-pin. Kolom yang di-pin jadi **sticky**: diam di tepi kiri/kanan sementara kolom lain lewat di belakangnya saat tabel di-scroll horizontal.

Keduanya **mati secara default**; nyalakan per halaman:

```tsx
<DataGridServer
  columns={columns}
  paginated={paginated}
  filters={filters}
  enableColumnPinning
  enableColumnOrdering
  defaultColumnPinning={{ start: ["no"], end: ["actions"] }}
/>
```

| Prop                   | Isi                                                                                    |
| ---------------------- | -------------------------------------------------------------------------------------- |
| `enableColumnPinning`  | Menampilkan item Pin/Unpin dan mengaktifkan sticky. Default `false`.                    |
| `enableColumnOrdering` | Menampilkan item Move to left / Move to right. Default `false`.                         |
| `defaultColumnPinning` | Kolom yang sudah ter-pin saat render pertama: `{ start: [...], end: [...] }`.           |
| `defaultColumnOrder`   | Urutan awal (array `id` kolom). Default mengikuti urutan definisi kolom.                |

Per kolom, `DataGridHeaderDropdown` menerima `showColumnActions={false}` untuk menyembunyikan grup Pin/Move di kolom itu saja.

Yang perlu diingat:

- **State-nya tidak persisten.** Pin, urutan, dan visibility hidup di `useState` — reload halaman mengembalikannya ke default. Jangan tambahkan localStorage tanpa diminta.
- **Kolom label-only (`DataGridHeader`) tidak punya menu**, jadi kolom `no` dan `actions` tidak bisa di-pin dari UI. Pin awalnya lewat `defaultColumnPinning`.
- **Move bergerak di dalam region-nya sendiri.** Kolom start-pinned hanya bertukar dengan sesama start-pinned, begitu juga end-pinned dan yang tidak di-pin — jadi "move to left" tidak pernah diam-diam melepas pin. Itu sebabnya itemnya ter-disable saat kolom sudah di tepi region-nya, bukan saat di tepi tabel.
- **Lebar kolom tetap otomatis.** Offset sticky diukur runtime dengan `ResizeObserver` di `data-grid-pinning.ts` — sengaja **tidak** memakai `columnSizingFeature` / `column.getSize()`, yang akan memaksa tiap kolom pinned ke lebar `size` (default 150) dan membuatnya melompat begitu di-pin. Jangan "perbaiki" ini dengan mendaftarkan `columnSizingFeature`.
- **Sel yang di-pin wajib punya background opaque**, kalau tidak kolom yang lewat di belakangnya menembus. Sel pinned mengulang state hover/selected baris lewat `group/row` — jangan hapus class `group/row` di `<TableRow>` kedua grid.
- **`data-table` tidak punya fitur ini.** Kalau user butuh pin atau reorder kolom, itu alasan sah memilih `data-grid`.

### 3. Pagination seperti apa?

Kedua paket punya prop `pagination` yang sama bentuknya di `Client` **dan** `Server`:

| Opsi                  | Nilai       | Isi                                                                                                  |
| --------------------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| **Advance** (default) | `"advance"` | "Menampilkan X–Y dari Z", "Halaman N dari M", tombol first / prev / next / last, plus pemilih ukuran |
| **Simple**            | `"simple"`  | Ringkasan yang sama, tombol Prev / Next saja                                                          |
| **Tanpa pagination**  | `"none"`    | Tidak merender kontrol pagination sama sekali                                                         |

```tsx
<DataTableClient columns={columns} data={rows} pagination="none" />
<DataGridServer columns={columns} paginated={paginated} filters={filters} pagination="none" />
```

`pagination="none"` di varian **Client** merender **semua** baris tanpa memotong halaman. Di varian **Server** baris yang tampil tetap persis apa yang dikirim `queries.ts` lewat `paginated.data` — jadi `"none"` di situ dipakai kalau query-nya memang sudah mengembalikan seluruh baris dan kontrol pindah halaman tidak relevan.

`toolbar` dan `pagination` independen: mengirim `toolbar` tanpa `pagination` tetap menampilkan pagination Advance (default).

### 4. Filter apa yang dibutuhkan?

| Kebutuhan                                    | Cara                                                                                                         |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Tidak ada                                    | Jangan kirim prop `toolbar`                                                                                   |
| Search box                                   | `toolbar={{ searches: [{ key, placeholder }] }}`                                                              |
| Filter multi-pilihan, ada Apply/Reset        | `toolbar={{ facets: [{ key, title, options }] }}` → dirender sebagai `FacetedFilter`                          |
| Filter satu-pilihan, langsung berlaku diklik | `toolbar={{ selects: [{ key, placeholder, options }] }}` → `SelectBox` (**`DataGridServer` saja**)             |
| Kombinasi apa pun                            | Kirim `searches`, `facets`, dan/atau `selects` sekaligus                                                       |

Dukungan `selects` **hanya ada di `DataGridServer`**. `DataGridClient`, `DataTableClient`, dan `DataTableServer` hanya menerima `searches` + `facets`.

Detail pilihan komponen filter (kapan `FacetedFilter`, kapan `SelectBox`) ada di `filter-pattern.md`. Tanyakan itu juga kalau user butuh filter.

### 5. Kolom actions seperti apa?

Berlaku untuk **kedua** paket tabel — pilihan ini murni di kolom `actions`.

| Opsi                 | Trigger                                       | Cocok untuk                                                                          |
| -------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Dropdown**         | Satu tombol `MoreHorizontal` (ikon titik tiga) | Banyak aksi (≥3) atau aksi yang jarang dipakai — hemat ruang                          |
| **Button icon only** | Satu tombol ikon per aksi, dengan `Tooltip`    | Sedikit aksi (2–3) yang sering dipakai — semua aksi langsung terlihat tanpa buka menu |

Kalau user tidak punya preferensi kuat, **sarankan button icon only** untuk 2 aksi (Ubah + Hapus) dan **dropdown** begitu ada 3 aksi atau lebih.

Delete **selalu** `AlertDialog` di kedua opsi (lihat `crud-pattern.md` D.5) — bedanya cuma bagaimana ia dipicu.

#### Template: Button icon only

```tsx
"use client"

import { EyeIcon, PencilIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

function RowActions({
  row,
  onView,
  onEdit,
}: {
  row: {Feature}
  onView: () => void
  onEdit: () => void
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button variant="secondary" size="icon-sm" aria-label="Lihat" onClick={onView} />
          }
        >
          <EyeIcon />
        </TooltipTrigger>
        <TooltipContent>Lihat</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button variant="secondary" size="icon-sm" aria-label="Ubah" onClick={onEdit} />
          }
        >
          <PencilIcon />
        </TooltipTrigger>
        <TooltipContent>Ubah</TooltipContent>
      </Tooltip>
      {/* tombol hapus + AlertDialog-nya */}
    </div>
  )
}
```

#### Template: Dropdown

**Trap wajib dibaca**: `AlertDialog` delete **tidak boleh** dirender di dalam `DropdownMenuContent` — isi menu di-unmount begitu menu tertutup (yang terjadi begitu sebuah item diklik), ikut membawa turun `AlertDialog` dan state `open`-nya sebelum dialog sempat muncul. Solusinya: angkat state `open` ke `RowActions` (di atas `DropdownMenu`) dan render `AlertDialog` sebagai **sibling** dari `DropdownMenu`.

```tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { EyeIcon, MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function RowActions({ row }: { row: {Feature} }) {
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
          <span className="sr-only">Buka menu</span>
          <MoreHorizontalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem render={<Link href={`/{features}/${row.id}`} />}>
            <EyeIcon />
            Lihat
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href={`/{features}/${row.id}/edit`} />}>
            <PencilIcon />
            Ubah
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2Icon />
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* AlertDialog dirender DI SINI — sibling, bukan di dalam DropdownMenuContent */}
    </>
  )
}
```

Template ini mengasumsikan pola UI "Halaman baru" (route detail/edit terpisah). Untuk pola Dialog / Sheet / Panel inline, ganti `render={<Link/>}` dengan `onClick={() => setDialog({ type: "edit", row })}` — pola sibling-render untuk delete tetap sama.

### Pertanyaan keenam yang sering terlupa

**Data-nya dari mana?** Ini menentukan varian `Client` atau `Server`:

|                                                                              | Pakai                                |
| ---------------------------------------------------------------------------- | ------------------------------------ |
| `queries.ts` mengembalikan seluruh baris sekali (tabel referensi kecil, enum) | `DataGridClient` / `DataTableClient` |
| `queries.ts` mengembalikan `Paginated<T>` lewat `paginate()`                  | `DataGridServer` / `DataTableServer` |

Jangan pakai varian `Client` di atas paginator — yang tampil hanya baris halaman itu saja, dan sort/search-nya cuma mengaduk satu halaman.

---

## data-table — template

Kolom didefinisikan sebagai data. Komponen yang merender `<TableRow>` / `<TableCell>`.

```tsx
"use client"

import Link from "next/link"

import { DataTableServer } from "@/components/data-table/data-table-server"
import type {
  DataTableColumn,
  DataTableFilters,
} from "@/components/data-table/types"
import { Badge } from "@/components/ui/badge"
import type { {Feature} } from "@/db/schema"
import type { Paginated } from "@/types/pagination"

import { PAGE_SIZE } from "../utils"

const columns: DataTableColumn<{Feature}>[] = [
  {
    key: "name",
    header: "Nama",
    sortable: true,
    cell: (row) => (
      <Link href={`/{features}/${row.id}`} className="hover:underline">
        {row.name}
      </Link>
    ),
  },
  {
    // Enum tetap (status, layout, dll.) → `Badge` varian bawaan
    // (default/secondary/destructive/outline) sudah otomatis benar di dark
    // mode karena pakai token tema. KALAU warnanya bebas dari DB (mis. hex
    // pilihan user, bukan enum), itu beda pola — lihat bagian "Dark mode" di
    // AGENTS.md dan contoh `parameter-value-badge.tsx`, jangan taruh hex
    // langsung ke `style` properti warna.
    key: "status",
    header: "Status",
    cell: (row) => <Badge>{row.status}</Badge>,
  },
  {
    key: "actions",
    header: "",
    align: "right",
    cell: (row) => <RowActions row={row} />,
  },
]

export function {Feature}Workspace({
  paginated,
  filters,
}: {
  paginated: Paginated<{Feature}>
  filters: DataTableFilters
}) {
  return (
    <DataTableServer
      columns={columns}
      paginated={paginated}
      filters={filters}
      url="/{features}"
      rowKey={(row) => row.id}
      pagination="advance"
      defaults={{ sort: "created_at", direction: "desc", perPage: PAGE_SIZE }}
      toolbar={{ searches: [{ key: "search", placeholder: "Cari {features}…" }] }}
      emptyTitle="Belum ada data."
      emptyFilteredTitle="Tidak ada hasil yang cocok."
    />
  )
}
```

Varian client sama persis, hanya menukar `paginated` / `filters` / `url` dengan `data`:

```tsx
<DataTableClient
  columns={columns}
  data={rows}
  rowKey={(row) => row.id}
  pagination="simple"
  pageSize={25}
/>
```

Field `DataTableColumn` yang tersedia: `key`, `header`, `cell`, `sortable`, `headerVariant`, `align`, `headClassName`, `cellClassName`, `sortValue`, `filterValue`, `searchable`.

Tiga field terakhir hanya berlaku di mode **client**: `sortValue` menentukan nilai yang disort (default `row[key]`), `filterValue` nilai yang dicocokkan search/facet, `searchable` menentukan kolom ikut dicari.

## data-grid — template

Kolom memakai column helper TanStack.

```tsx
"use client"

import { createColumnHelper } from "@tanstack/react-table"

import { DataGridHeader } from "@/components/data-grid/data-grid-header"
import { DataGridHeaderSort } from "@/components/data-grid/data-grid-header-sort"
import { DataGridServer } from "@/components/data-grid/data-grid-server"
import type { DataGridFeatures } from "@/components/data-grid/data-grid-features"
import type { {Feature} } from "@/db/schema"

const columnHelper = createColumnHelper<DataGridFeatures, {Feature}>()

export const {feature}Columns = columnHelper.columns([
  columnHelper.display({
    id: "no",
    header: () => <DataGridHeader title="No." />,
    enableHiding: false,
    cell: ({ row, table }) => {
      // Varian Server memakai manual pagination, jadi `table` hanya berisi baris
      // halaman ini — offset dibutuhkan supaya nomor menyambung antar halaman.
      const { pageIndex, pageSize } = table.store.state.pagination

      return pageIndex * pageSize + row.getDisplayIndex() + 1
    },
  }),
  columnHelper.accessor("name", {
    header: ({ column }) => <DataGridHeaderSort column={column} title="Nama" />,
  }),
  columnHelper.accessor("status", {
    header: () => <DataGridHeader title="Status" />,
  }),
  columnHelper.display({
    id: "actions",
    header: () => <div className="text-right" />,
    cell: ({ row }) => <RowActions row={row.original} />,
  }),
])
```

**Wajib `columnHelper.columns([...])`**, bukan array literal biasa — array literal ditolak TypeScript karena variance `ColumnDef<…, TValue>`.

Pemakaiannya:

```tsx
<DataGridServer
  columns={{feature}Columns}
  paginated={paginated}
  filters={filters}
  url="/{features}"
  getRowId={(row) => String(row.id)}
/>
```

Kalau menambah kolom yang perlu filter facet, daftarkan `filterFn: "multiValue"` — filter fn itu sudah terdaftar di `data-grid-features.ts`.

---

## Trap yang sudah ditemukan

- **Kolom sortable di frontend wajib dikenali `queries.ts`.** Menambah kolom `sortable: true` (atau `DataGridHeaderSort`) tanpa menambahkan `key`-nya ke map kolom yang boleh disort di `queries.ts` membuat klik Asc/Desc terlihat tidak berfungsi: URL berubah jadi `?sort={kolom}`, tapi query jatuh ke `?? default` dan urutan baris tidak berubah — **tanpa error apa pun**. Pola map-nya:

  ```ts
  const sortable = {
    name: {table}.name,
    email: {table}.email,
    created_at: {table}.createdAt,
  } as const

  const column = sortable[sort as keyof typeof sortable] ?? {table}.createdAt
  ```

  `key` kolom di frontend harus sama persis dengan key di map ini. Setiap kali menambah kolom sortable baru, perbarui map-nya.

- **`per_page` hanya bekerja kalau `queries.ts` membacanya.** Komponen mengirim `?per_page=N`, tapi tidak ada yang memaksa query memakainya. Karena itu `DataTableServer` punya prop `showPageSize` yang **default `false`** — nyalakan hanya setelah `queries.ts` benar-benar memvalidasi dan memakai `per_page`. `DataGridServer` **selalu** menampilkan pemilih itu, jadi di halaman data-grid selektor itu tidak berefek sampai query-nya menyusul. Validasi nilainya (batas atas + whitelist), jangan langsung `Number(searchParams.per_page)`.

- **`rowKey` (data-table) itu penting.** Tanpa itu index array dipakai sebagai React key, yang bikin state baris (menu terbuka, dialog konfirmasi) meloncat saat data berubah urutan.

- **`getRowId` (data-grid) lebih penting lagi.** Tanpa itu TanStack memakai index baris sebagai row id — setelah delete, sort, atau ganti halaman, index yang sama ditempati record lain, dan React menganggapnya komponen yang sama alih-alih unmount/remount. Akibatnya state lokal per baris ikut "menempel" ke baris berikutnya alih-alih reset. Gejalanya persis seperti "dialog konfirmasi hapus masih muncul setelah barisnya dihapus". Selalu kirim `getRowId={(row) => String(row.id)}`.

- **Aturan key search di mode client `data-table`.** `SearchConfig.key` yang sama dengan `key` sebuah kolom akan memfilter kolom itu saja; key lain (mis. `"search"`) mencari ke **semua** kolom yang `searchable`. Pakai key generik kalau mau satu kotak search untuk beberapa kolom sekaligus.

- **Nilai kosong saat sorting client.** `data-table` selalu menaruh nilai kosong / `null` di bawah, baik ascending maupun descending — jangan "perbaiki" jadi ikut terbalik.

- **`DataGridClient` tidak punya prop `pageSize`.** Ukuran halamannya terkunci di `PAGE_SIZE` (10) dari `constants.ts`. `DataTableClient` punya `pageSize`. Kalau butuh ukuran lain di grid client, ubah lewat pemilih ukuran di UI atau pakai `data-table`.

- **`selects` hanya di `DataGridServer`.** Mengirim `toolbar.selects` ke `DataTableServer` / `DataTableClient` / `DataGridClient` tidak akan merender apa pun — tipenya bahkan tidak menerima field itu.

- **Facet multi-nilai dikirim sebagai `?key=a&key=b`.** Page menerimanya sebagai `string[]` dari `searchParams`. Normalisasi di page (nilai tunggal datang sebagai `string`, bukan array) sebelum diteruskan ke query.

- **Jangan pasang TanStack langsung di halaman.** Kalau butuh TanStack, lewat `@/components/data-grid`. Kalau tidak, pakai `data-table`.

- **Jangan bikin komponen pagination / search / sort header baru.** Semuanya sudah ada di kedua paket dan bisa dipakai lepas dari `Client` / `Server` (mis. `DataTableHeaderSort` di tabel yang ditulis tangan).

- **Jangan gambar `<Empty>` manual.** Keempat komponen sudah merender empty state dan memilih sendiri antara pasangan `emptyTitle` / `emptyDescription` dan `emptyFiltered*`.

- **Base UI, bukan Radix.** Trigger memakai `render={<Button/>}`, bukan `asChild`. `DropdownMenuItem` memakai `onClick`, bukan `onSelect` — `onSelect` **lolos typecheck** (React DOM punya event seleksi teks) lalu diam-diam tidak berfungsi. Tidak perlu `setTimeout` untuk membuka dialog dari item menu.

- **Definisi kolom di Server Component.** Gagal saat runtime dengan "Functions cannot be passed directly to Client Components". Lihat bagian teratas dokumen ini.
