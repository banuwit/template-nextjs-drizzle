---
title: Halaman list + CRUD (Next.js + Drizzle)
description: Spesifikasi lengkap dan mandiri untuk membangun halaman list terpaginasi plus CRUD. Empat pola UI create/edit/view - Halaman baru, Dialog, Sheet, Panel inline. Tanya user dulu, jangan mengasumsikan.
globs:
  - src/app/**
  - src/db/schema/**
  - src/lib/validations/**
  - src/types/pagination.ts
  - src/components/app-sidebar.tsx
---

# Halaman list + CRUD (Next.js + Drizzle)

Kapan dipakai: menambah atau mengubah halaman list / data-grid, atau CRUD di atas list itu (create, edit, view, delete).

Dokumen ini **mandiri**. Semua struktur file, perintah, dan template kode ada di sini. Jangan bergantung pada fitur contoh tertentu di `src/app/` — kalau fitur contoh sudah dihapus, dokumen ini tetap cukup untuk menghasilkan halaman yang identik.

Stack: **Next.js 16 App Router + React 19 + Drizzle + PostgreSQL**. Bukan Laravel/Inertia — jangan copy Artisan, Wayfinder, Policy, Eloquent, atau Pest.

Placeholder yang dipakai di seluruh dokumen:

| Placeholder  | Arti                                   | Contoh     |
| ------------ | -------------------------------------- | ---------- |
| `{Feature}`  | PascalCase, untuk nama tipe & komponen | `Employee` |
| `{feature}`  | kebab-case singular, prefix nama file  | `employee` |
| `{features}` | kebab-case plural = segmen route       | `employees`|
| `{table}`    | nama tabel Postgres (snake_case)       | `employees`|

## Prinsip

- Tidak ada generator CRUD. Lapisan tabelnya memakai komponen di `@/components/data-table` atau `@/components/data-grid` — **tanya user dulu** paket mana.
- TanStack Table hanya lewat `@/components/data-grid`. Jangan pasang TanStack langsung di halaman.
- Tidak ada service class. Baca di `queries.ts`, tulis di `actions.ts`, keduanya milik folder fitur.
- UI tidak pernah menyentuh `db` langsung. Page memanggil fungsi bernama dari `queries.ts`.
- Tidak ada `src/db/queries/` global. Colocation per fitur lebih mudah disalin untuk halaman baru.

---

## Langkah 0 - tanya user pola UI mana

Sebelum scaffold `new/`, `[id]/`, Dialog, Sheet, atau panel inline: **tanya user** pola mana yang dipakai.

| Opsi             | Ringkasan                                                         | Route                              |
| ---------------- | ----------------------------------------------------------------- | ---------------------------------- |
| **Halaman baru** | Route + halaman terpisah `new/`, `[id]/`, `[id]/edit/`            | Semua route di atas dibuat         |
| **Dialog**       | Modal shadcn `Dialog` di atas list                                | Hanya `{features}/page.tsx`        |
| **Sheet**        | Panel `Sheet` (fixed, overlay) dari kanan                         | Hanya `{features}/page.tsx`        |
| **Panel inline** | Panel non-modal di area konten; list menyusut jadi 2 kolom        | Hanya `{features}/page.tsx`        |

Aturan:

- Jangan mengasumsikan. Jangan mulai implementasi create/edit/view sampai ada jawaban.
- Lewati pertanyaan hanya jika user sudah menyatakan pilihannya di permintaan yang sama (misalnya "pakai panel inline").
- Tanya sekali untuk ketiga aksi (create, edit, view). Kalau user ingin campuran (misalnya create Dialog, view halaman), ikuti itu — jangan mencampur tanpa izin.
- Delete **selalu** `AlertDialog` di kolom aksi list, apa pun pilihan create/edit/view.
- Jangan mencampur dua pola di satu fitur.

### Kapan memilih yang mana

| Pertanyaan                                            | Jawabannya                       |
| ----------------------------------------------------- | -------------------------------- |
| Form perlu URL sendiri (bisa di-bookmark / di-share)? | Halaman baru                     |
| Form pendek, ingin tetap di konteks list?             | Dialog                           |
| Form panjang, ingin fokus penuh, list boleh diblokir? | Sheet                            |
| User perlu tetap memakai list saat panel terbuka?     | Panel inline                     |
| Breadcrumb/header aplikasi tidak boleh tertutup?      | Panel inline                     |

---

# Bagian A - Struktur folder fitur

Satu fitur = satu folder `src/app/{features}/`. Hanya file route yang boleh di root folder; subfolder tanpa `page.tsx` tidak membuat route, jadi aman untuk colocation.

```
src/app/{features}/
├── page.tsx                 # route: list
├── loading.tsx              # Skeleton saat segment loading
├── error.tsx                # error boundary (client; prop `retry`)
├── actions.ts               # "use server" — semua mutasi
├── queries.ts               # import "server-only" — semua baca DB
├── types/index.ts           # {Feature}FormFields, {Feature}ActionState, …
├── utils/index.ts           # PAGE_SIZE, parse…ListParams, build…Href
├── hooks/                   # hook client khusus fitur
└── components/              # komponen khusus fitur, prefix nama fitur
```

Pola **Halaman baru** menambah:

```
├── new/page.tsx
├── [id]/page.tsx
├── [id]/not-found.tsx
└── [id]/edit/page.tsx
```

File bersama (bukan milik fitur):

| Path                          | Isi                                                     |
| ----------------------------- | ------------------------------------------------------- |
| `src/db/schema/{table}.ts`    | definisi tabel + `$inferSelect` / `$inferInsert`         |
| `src/db/schema/index.ts`      | barrel — **wajib** `export * from "./{table}"`           |
| `src/lib/validations/{feature}.ts` | skema zod, dipakai create + edit                    |
| `src/lib/pagination.ts`       | `paginate()` — bentuk hasil Drizzle jadi `Paginated<T>`  |
| `src/types/pagination.ts`     | tipe `Paginated<T>`                                      |
| `src/lib/db-errors.ts`        | `isUniqueViolation()`                                    |
| `src/lib/form.ts`             | `toFieldErrors()`                                        |
| `src/hooks/use-list-navigation.ts` | navigasi query-string untuk list server-driven      |
| baris `menus` (`/menus` + `src/db/seed.ts`) | item navigasi (ikon baru → peta `ICONS` di `app-sidebar.tsx`) |

Aturan penamaan:

- Komponen di-prefix nama fitur (`{feature}-form.tsx`, `{feature}-table.tsx`) supaya tetap jelas saat diimpor dari tempat lain.
- `{Feature}ActionState`, bukan `ActionState` — tanpa prefix, fitur kedua yang disalin akan tabrakan.

---

# Bagian B - Data layer

## B.1 Schema

`src/db/schema/{table}.ts`:

```ts
import { sql } from "drizzle-orm"
import { pgTable, uniqueIndex, varchar } from "drizzle-orm/pg-core"

import { auditColumns, identityColumns } from "./columns"

export const {table} = pgTable(
  "{table}",
  {
    ...identityColumns(), // internalId (integer PK) + id (uuid v7, publik)
    name: varchar({ length: 255 }).notNull(),
    code: varchar({ length: 2 }).notNull(),
    ...auditColumns(), // created/updated/deleted _at + _by
  },
  (table) => [
    uniqueIndex("{table}_code_unique").on(table.code).where(sql`${table.deletedAt} is null`),
  ],
)

export type {Feature} = typeof {table}.$inferSelect
export type New{Feature} = typeof {table}.$inferInsert
```

Aturan:

- **Nama kolom ditulis manual**, bukan lewat opsi `casing`. Properti satu kata boleh tanpa argumen (`name`, `id`); properti multi-kata **wajib** argumen snake_case — `createdAt: timestamp("created_at")`. Tanpa itu kolomnya jadi `"createdAt"` di Postgres dan harus selalu dikutip di SQL.
- Tipe diturunkan dari schema (`$inferSelect` / `$inferInsert`). Jangan menulis `interface {Feature}` terpisah — dua sumber kebenaran akan menyimpang diam-diam.
- Kolom unique diberi `.unique()` supaya bentrok tertangkap DB, bukan lewat query cek manual yang punya race condition.
- Kolom yang dipakai `WHERE` / `ORDER BY` diberi index.
- Selalu ada `createdAt` — list default sort ke kolom ini.
- FK: `uuid("parent_id").references(() => parents.id, { onDelete: "cascade" })`. Arrow function mencegah import melingkar; `onDelete` harus disengaja. Properti `id` = uuid v7 publik; `internalId` hanya untuk tie-breaker sort.
- Unique memakai partial index `WHERE deleted_at IS NULL` supaya baris yang di-soft-delete tidak memblokir nilai yang sama.
- **Auth:** setiap fungsi `queries.ts` dan server action wajib diawali `await requireUser()` ([src/lib/session.ts](../../src/lib/session.ts)); setiap query memfilter `isNull({table}.deletedAt)`.

## B.2 Barrel + migrasi

Tambah `export * from "./{table}"` di `src/db/schema/index.ts`. **Paling sering terlupa.** `drizzle.config.ts` menunjuk barrel itu — kalau terlewat, `db:generate` bilang *"No schema changes"* padahal file schema sudah ada, tanpa error.

```bash
npm run db:generate   # tulis drizzle/000X_*.sql
# baca file SQL-nya — WAJIB sebelum lanjut
npm run db:migrate
```

Yang dicurigai di SQL: `DROP TABLE` / `DROP COLUMN` yang tidak dimaksud, rename yang jadi drop+create, kolom camelCase (argumen nama terlewat). SQL salah → **jangan** edit file migrasi; perbaiki schema, hapus file migrasi + snapshot `meta` yang baru, lalu `db:generate` ulang.

Jangan campur `db:push` dengan `generate`/`migrate` di database yang sama — hasilnya `relation "…" already exists`. `push` hanya untuk eksperimen di database terpisah.

Commit schema + `drizzle/000X_*.sql` + `drizzle/meta/` sebagai satu paket.

## B.3 Validasi

`src/lib/validations/{feature}.ts` — satu skema dipakai create dan edit:

```ts
import { z } from "zod"

export const {feature}FormSchema = z.object({
  name: z
    .string()
    .min(1, "Nama wajib diisi")
    .max(255, "Nama maksimal 255 karakter"),
  code: z
    .string()
    .length(2, "Kode harus 2 huruf")
    .regex(/^[A-Z]{2}$/, "Kode harus 2 huruf A–Z"),
})
```

Normalisasi nilai mentah (`trim`, `toUpperCase`) dilakukan di `actions.ts` **sebelum** `safeParse`, supaya pesan error mencerminkan nilai final yang akan disimpan.

## B.4 Tipe fitur

`src/app/{features}/types/index.ts`:

```ts
import type { New{Feature} } from "@/db/schema"

export type {Feature}FormFields = Pick<New{Feature}, "name" | "code">

export type {Feature}FormErrors = Partial<
  Record<keyof {Feature}FormFields | "form", string[]>
>

export type {Feature}ActionState = {
  errors?: {Feature}FormErrors
  values?: {Feature}FormFields
  ok?: boolean
}

export type {Feature}ListParams = {
  q: string
  page: number
}
```

`values` dikembalikan supaya form bisa mengisi ulang input setelah gagal validasi. Key `"form"` di `errors` menampung error tingkat form (mis. bentrok unique) yang bukan milik satu field.

## B.5 `queries.ts` — baca

```ts
import "server-only"

import { cache } from "react"
import { count, desc, eq, ilike, or, type SQL } from "drizzle-orm"

import { db } from "@/db"
import { {table}, type {Feature} } from "@/db/schema"
import { paginate } from "@/lib/pagination"
import type { Paginated } from "@/types/pagination"

import type { {Feature}ListParams } from "./types"
import { PAGE_SIZE } from "./utils"

/** Satu baris; `undefined` kalau id bukan uuid, tidak ada, atau sudah di-soft-delete. */
export const get{Feature}ById = cache(
  async (rawId: string): Promise<{Feature} | undefined> => {
    await requireUser()

    // Validasi dulu: Postgres melempar error (bukan "tidak ketemu") untuk teks bukan uuid.
    const id = z.uuid().safeParse(rawId)

    if (!id.success) {
      return undefined
    }

    const [row] = await db
      .select()
      .from({table})
      .where(and(eq({table}.id, id.data), isNull({table}.deletedAt)))
      .limit(1)

    return row
  }
)

export async function list{Feature}s({
  q,
  page,
}: {Feature}ListParams): Promise<Paginated<{Feature}>> {
  const where: SQL | undefined = q
    ? or(ilike({table}.name, `%${q}%`), ilike({table}.code, `%${q}%`))
    : undefined

  const [rows, [totals]] = await Promise.all([
    db
      .select()
      .from({table})
      .where(where)
      .orderBy(desc({table}.createdAt), desc({table}.id))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ value: count() }).from({table}).where(where),
  ])

  return paginate({ rows, total: totals?.value ?? 0, page, perPage: PAGE_SIZE })
}
```

Aturan:

- `import "server-only"` di baris pertama — impor tak sengaja dari Client Component jadi gagal saat build, bukan bocor ke bundle.
- Bungkus `getXById` dengan `React.cache()` bila ada halaman `[id]`: `generateMetadata` dan page memakai satu query, bukan dua.
- List + count di-`Promise.all` — keduanya independen.
- `paginate()` dari `@/lib/pagination` menghasilkan `Paginated<T>` (`data`, `current_page`, `last_page`, `per_page`, `total`, `from`, `to`) yang langsung diterima `DataTableServer` / `DataGridServer`.
- Search pakai `ilike` dengan `%…%`. Untuk term dari user, tidak perlu escape manual — Drizzle mem-parameterisasi nilainya.

## B.6 `actions.ts` — tulis

```ts
"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db"
import { {table} } from "@/db/schema"
import { isUniqueViolation } from "@/lib/db-errors"
import { {feature}FormSchema } from "@/lib/validations/{feature}"

import type { {Feature}ActionState, {Feature}FormFields } from "./types"

type ParseResult =
  | { ok: true; data: {Feature}FormFields }
  | { ok: false; state: {Feature}ActionState }

function parse{Feature}Form(formData: FormData): ParseResult {
  // Normalisasi dulu, baru validasi — pesan error mencerminkan nilai final.
  const values = {
    name: String(formData.get("name") ?? "").trim(),
    code: String(formData.get("code") ?? "").trim().toUpperCase(),
  }

  const parsed = {feature}FormSchema.safeParse(values)

  if (!parsed.success) {
    return {
      ok: false,
      state: { errors: z.flattenError(parsed.error).fieldErrors, values },
    }
  }

  return { ok: true, data: parsed.data }
}

const TAKEN: {Feature}ActionState["errors"] = {
  form: ["Nama atau kode sudah terdaftar"],
}

export async function create{Feature}(
  _prevState: {Feature}ActionState,
  formData: FormData
): Promise<{Feature}ActionState> {
  const parsed = parse{Feature}Form(formData)

  if (!parsed.ok) {
    return parsed.state
  }

  try {
    await db.insert({table}).values(parsed.data)
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { errors: TAKEN, values: parsed.data }
    }
    throw error
  }

  revalidatePath("/{features}")

  // Pola overlay: berhenti di sini, kembalikan { ok: true }.
  return { ok: true, values: parsed.data }

  // Pola Halaman baru: ganti dua baris di atas dengan `redirect("/{features}")`
  // — DI LUAR try. Lihat catatan di bawah.
}

export async function delete{Feature}(id: string): Promise<void> {
  const user = await requireUser()

  // Soft delete: baris tetap ada, hilang dari list karena query memfilter deletedAt.
  await db
    .update({table})
    .set({ deletedAt: new Date(), deletedBy: user.id })
    .where(and(eq({table}.id, id), isNull({table}.deletedAt)))
  revalidatePath("/{features}")
}
```

Aturan mutasi:

- Signature action form: `(prevState, formData) => Promise<{Feature}ActionState>`, dipakai lewat `useActionState`. Argumen tambahan di-bind: `update{Feature}.bind(null, id)`.
- Validasi dengan zod di dalam action, kembalikan `z.flattenError(err).fieldErrors`, plus `values` supaya form bisa terisi ulang.
- Bentrok unique ditangkap `isUniqueViolation(error)` dan diubah jadi field/form error — **bukan** 500.
- Sukses:
  - **Halaman baru** → `revalidatePath()` lalu `redirect()`.
  - **Dialog / Sheet / Panel inline** → `revalidatePath()` + `{ ok: true }`, **tanpa** `redirect()`. Client yang menutup overlay.
- **`redirect()` selalu di luar `try`.** Ia bekerja dengan melempar exception internal; dipanggil di dalam `try` akan tertangkap `catch` dan diperlakukan sebagai error.

## B.7 `utils/index.ts`

```ts
import type { {Feature}ListParams } from "../types"

export const PAGE_SIZE = 10

/** Nilai tak masuk akal (page=0, "abc", array) jatuh ke default. */
export function parse{Feature}ListParams(searchParams: {
  [key: string]: string | string[] | undefined
}): {Feature}ListParams {
  const q = typeof searchParams.q === "string" ? searchParams.q.trim() : ""
  const requested = Number(
    typeof searchParams.page === "string" ? searchParams.page : "1"
  )
  const page = Number.isInteger(requested) && requested > 0 ? requested : 1

  return { q, page }
}

export function build{Feature}sHref({ page, q }: {Feature}ListParams): string {
  const params = new URLSearchParams()

  if (q) params.set("q", q)
  if (page > 1) params.set("page", String(page))

  const query = params.toString()

  return query ? `/{features}?${query}` : "/{features}"
}
```

Query string adalah satu-satunya sumber kebenaran state list. Param yang sama dengan default dihilangkan dari URL supaya address bar tetap bersih.

---

# Bagian C - Lapisan tabel

Empat komponen tersedia. **Tanya user** paket mana sebelum implementasi.

| Komponen           | Kapan dipakai                                                              |
| ------------------ | -------------------------------------------------------------------------- |
| `DataTableServer`  | List biasa; sort/search/filter/paging dikerjakan DB lewat query string      |
| `DataTableClient`  | Semua baris sudah di tangan; sort/filter/paging di browser                  |
| `DataGridServer`   | Sama seperti `DataTableServer` + kolom pinning, ordering, visibility toggle |
| `DataGridClient`   | Versi client dari grid                                                      |

`data-table` memakai primitif `Table` shadcn dengan definisi kolom sederhana. `data-grid` memakai TanStack Table v9 dan menerima `ColumnDef` — pilih ini hanya kalau butuh pin/reorder/hide kolom.

Filter toolbar: `FacetedFilter` (multi-pilih dengan tombol Apply) dan `SelectBox` (satu pilihan, langsung berlaku) di `@/components/filters`.

Pemilihan lengkapnya punya dokumen sendiri, dan keduanya memuat langkah wajib bertanya ke user:

- **`table-pattern.md`** — paket mana, bentuk header, bentuk pagination, kolom actions, plus template tiap kombinasi.
- **`filter-pattern.md`** — `FacetedFilter` vs `SelectBox`, single/multi/search, tampilan option, dan cara membaca nilai filter di server.

Yang tetap berlaku di dokumen ini: `queries.ts` mengembalikan `Paginated<T>` lewat `paginate()`, halaman meneruskan `searchParams` apa adanya sebagai prop `filters`, dan varian `*Server` yang mengurus navigasi query string — jangan tulis ulang logic itu di halaman.

## C.1 Definisi kolom WAJIB di Client Component

Ini konsekuensi App Router yang tidak ada di Inertia, dan paling sering menjatuhkan implementasi pertama.

`cell`, `header`, dan `rowKey` adalah **fungsi**. React tidak mengizinkan fungsi dioper dari Server Component ke Client Component. Server Component yang mendefinisikan kolom lalu merender `<DataTableServer columns={…}>` akan gagal saat runtime:

> Functions cannot be passed directly to Client Components

Jadi susunannya **selalu** tiga lapis:

```
page.tsx                     Server Component — query DB, oper data serializable
└── {feature}-workspace.tsx  "use client" — pegang definisi kolom + state overlay
    └── <DataTableServer />  komponen generik
```

```tsx
// components/{feature}-workspace.tsx
"use client"

import { DataTableServer } from "@/components/data-table/data-table-server"
import type {
  DataTableColumn,
  DataTableFilters,
} from "@/components/data-table/types"
import type { Paginated } from "@/types/pagination"
import type { {Feature} } from "@/db/schema"

import { PAGE_SIZE } from "../utils"

const columns: DataTableColumn<{Feature}>[] = [
  {
    key: "name",
    header: "Nama",
    cell: (row) => <span className="font-medium">{row.name}</span>,
    sortable: true,
  },
  {
    key: "created_at",
    header: "Dibuat",
    cell: (row) => row.createdAt.toLocaleDateString("id-ID"),
    sortable: true,
    align: "right",
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
      defaults={{ sort: "created_at", direction: "desc", perPage: PAGE_SIZE }}
      toolbar={{ searches: [{ key: "search", placeholder: "Cari…" }] }}
      emptyTitle="Belum ada data."
      emptyFilteredTitle="Tidak ada hasil yang cocok."
    />
  )
}
```

Untuk `data-grid`, bungkus array kolom dengan `columnHelper.columns([...])` — array literal biasa ditolak TypeScript karena variance:

```tsx
const columnHelper = createColumnHelper<DataGridFeatures, {Feature}>()

export const {feature}Columns = columnHelper.columns([
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <DataGridHeaderDropdown column={column} title="Nama" />
    ),
    cell: ({ row }) => row.original.name,
  }),
])
```

## C.2 Yang tidak boleh ditulis tangan

Sort, search berdebounce, facet, dan pagination **sudah ada di dalam komponen**. Jangan menulis ulang helper `visit`, `SortableHead`, debounce, atau markup pagination di halaman.

Varian `*Server` menulis state ke query string lewat `useListNavigation` (`src/hooks/use-list-navigation.ts`) — `router.replace()` + `useTransition()`, sehingga halaman tidak reload penuh dan tombol Back tetap benar. Facet multi-pilih dikirim sebagai `?key=a&key=b` dan diterima page sebagai `string[]`.

## C.3 Empty state

Dua salinan berbeda: "belum ada data" versus "tidak ada hasil filter". Komponen sudah merender ini sendiri dan memilih pasangan mana yang tampil — **jangan** menggambar `<Empty>` manual.

```tsx
emptyTitle="Belum ada {features}."
emptyDescription="Tambahkan satu untuk memulai."
emptyFilteredTitle="Tidak ada {features} yang cocok"
emptyFilteredDescription="Coba kata kunci lain, atau bersihkan pencarian."
```

`emptyFiltered*` boleh dihilangkan — jatuh balik ke `emptyTitle` / `emptyDescription`. Tombol Create untuk kasus "belum ada data" tetap di baris `Heading`; komponen tabel tidak punya slot tombol Create di empty state.

---

# Bagian D - Halaman list (sama untuk keempat pola)

## D.1 `page.tsx`

```tsx
import type { Metadata } from "next"
import Link from "next/link"
import { PlusIcon } from "lucide-react"

import Heading from "@/components/heading"
import { AppLayout } from "@/components/layouts/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import { {Feature}Workspace } from "./components/{feature}-workspace"
import { list{Feature}s } from "./queries"
import { parse{Feature}ListParams } from "./utils"

export const metadata: Metadata = { title: "{Features}" }

// Halaman ini query DB: tanpa ini `next build` memprerender dan membekukan hasilnya.
export const dynamic = "force-dynamic"

export default async function {Feature}sPage({
  searchParams,
}: PageProps<"/{features}">) {
  const filters = await searchParams
  const { q, page } = parse{Feature}ListParams(filters)
  const paginated = await list{Feature}s({ q, page })

  return (
    <AppLayout breadcrumbs={[{ label: "{Features}" }]}>
      <div className="flex h-full flex-1 flex-col gap-6 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <Heading variant="small" title="{Features}" />
          {/* Tombol Create — bentuknya beda per pola, lihat Bagian E */}
        </div>

        <Card className="gap-0 overflow-hidden py-0">
          <CardContent className="flex flex-col gap-4 p-4">
            <{Feature}Workspace paginated={paginated} filters={filters} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
```

Wajib di setiap page:

- `metadata` atau `generateMetadata`.
- `export const dynamic = "force-dynamic"` bila query DB. Verifikasi di output build: rutenya `ƒ`, bukan `○`.
- `PageProps<"/{features}">` — tipe global hasil generate. Jangan tulis tangan `params` / `searchParams`. Tipe ini baru ada setelah `next dev` atau `next build` pernah jalan.
- Page hanya mengoper data **serializable**. Jangan mengimpor komponen tabel/search/pagination di page lalu mengopernya sebagai prop ke Client Component — Client workspace yang mengimpornya sendiri.

## D.2 `loading.tsx` dan `error.tsx`

Keduanya wajib.

```tsx
// error.tsx
"use client"

export default function {Feature}sError({ retry }: { retry: () => void }) {
  return <button onClick={retry}>Coba lagi</button>
}
```

Prop-nya `retry`, **bukan** `reset` — itu perubahan Next.js 16.

## D.3 Layout dan copy

- Susunan: `Heading` + tombol Create, lalu komponen tabel (yang sudah membawa toolbar + tabel + pagination sebagai satu blok). Tidak perlu `CardHeader`/`CardFooter` terpisah kecuali user minta.
- Breadcrumb di bawah judul `Heading` (bukan di header sidebar). Trails tetap dioper ke `AppLayout breadcrumbs={...}`.
- Pakai `gap-*`, bukan `space-y-*`. Pakai token semantik (`text-muted-foreground`), bukan warna mentah — token sudah otomatis benar di dark mode, warna mentah tidak. Kalau fitur butuh warna BEBAS dari DB (bukan token, mis. badge warna custom), lihat bagian "Dark mode" di [AGENTS.md](../../AGENTS.md) dan contoh [parameter-value-badge.tsx](../../src/app/parameters/components/parameter-value-badge.tsx) — jangan pasang hex langsung ke `style` properti warna, itu tidak bisa di-override `dark:`.
- Semua copy UI bahasa Inggris (label, placeholder, toast, pesan zod, error dari action). Label nav dan breadcrumb = nama fitur supaya cocok dengan sidebar (sidebar dirender dari tabel `menus` — tambahkan barisnya).

## D.4 Form create/edit

Satu komponen form dipakai create dan edit.

```tsx
"use client"

import { useActionState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { toFieldErrors } from "@/lib/form"

import type { {Feature}ActionState, {Feature}FormFields } from "../types"

export function {Feature}Form({
  action,
  defaultValues,
  submitLabel,
  successTitle,
  onClose,
}: {
  action: (
    prevState: {Feature}ActionState,
    formData: FormData
  ) => Promise<{Feature}ActionState>
  defaultValues?: {Feature}FormFields
  submitLabel: string
  successTitle: string
  onClose: () => void
}) {
  const [state, formAction, pending] = useActionState<
    {Feature}ActionState,
    FormData
  >(action, {})

  useEffect(() => {
    if (!state.ok) return

    toast.add({ type: "success", title: successTitle })
    onClose()
  }, [state.ok, successTitle, onClose])

  const nameErrors = state.errors?.name

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <FieldGroup>
        <Field data-invalid={nameErrors ? true : undefined}>
          <FieldLabel htmlFor="{feature}-name">Nama</FieldLabel>
          <Input
            id="{feature}-name"
            name="name"
            autoComplete="off"
            aria-invalid={nameErrors ? true : undefined}
            defaultValue={state.values?.name ?? defaultValues?.name}
          />
          <FieldError errors={toFieldErrors(nameErrors)} />
        </Field>
      </FieldGroup>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onClose}>
          Batal
        </Button>
        <Button type="submit" disabled={pending}>
          {pending && <Spinner data-icon="inline-start" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
```

Aturan form:

- Setiap field: `Field` + `FieldLabel` + kontrol + `FieldError`, dengan `data-invalid` dan `aria-invalid`.
- **Tidak ada react-hook-form dan tidak ada `ui/form.tsx`** di proyek ini. Error dirender lewat `<FieldError errors={toFieldErrors(...)} />`.
- `defaultValue={state.values?.x ?? defaultValues?.x}` — setelah gagal validasi, input terisi nilai yang tadi dikirim, bukan kosong.
- Mode edit mem-bind id: `update{Feature}.bind(null, id)`.
- Beri `id` unik ber-prefix bila beberapa form bisa dirender bersamaan di satu halaman.
- **Boolean dari `Switch` / `Checkbox`:** field yang tidak dicentang **tidak terkirim** di FormData. Pakai `useState` + `<input type="hidden" name="…" value={on ? "1" : "0"} />` supaya nilainya selalu eksplisit.

## D.5 Delete (wajib, semua pola)

Selalu `AlertDialog`, dipicu dari kolom aksi. Dialog dan menunya **bersaudara**, bukan bersarang:

```tsx
"use client"

import * as React from "react"
import { MoreHorizontalIcon, Trash2Icon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"

import { delete{Feature} } from "../actions"

export function {Feature}RowActions({ row }: { row: { id: string; name: string } }) {
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [pending, startTransition] = React.useTransition()

  function confirmDelete() {
    startTransition(async () => {
      try {
        await delete{Feature}(row.id)
        setConfirmOpen(false)
        toast.add({ type: "success", title: "Data dihapus" })
      } catch {
        toast.add({ type: "error", title: "Gagal menghapus" })
      }
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
          <span className="sr-only">Buka menu</span>
          <MoreHorizontalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
            <Trash2Icon />
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus {row.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Data ini dihapus permanen. Tindakan ini tidak bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={pending}
              onClick={confirmDelete}
            >
              {pending && <Spinner />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
```

**Kenapa dialog di luar `DropdownMenu`:** isi menu di-unmount begitu menu tertutup — dan itu terjadi saat item apa pun diklik. `AlertDialog` yang bersarang di dalamnya ikut hilang sebelum sempat tampil. Simpan `open` di komponen yang hidup lebih lama daripada menunya.

## D.6 Mode view (read-only)

Edit **hanya** dipicu dari kolom aksi di list, bukan dari tampilan view.

| Pola             | Di view                                                | Cara menutup / kembali                     |
| ---------------- | ------------------------------------------------------ | ------------------------------------------ |
| **Dialog**       | Tanpa `DialogFooter`; tanpa tombol Close atau Edit     | X dialog + klik luar overlay               |
| **Sheet**        | Tanpa `SheetFooter`; tanpa tombol Close atau Edit      | X sheet + klik luar overlay                |
| **Panel inline** | Tanpa footer panel; tanpa tombol Close atau Edit       | X di header panel                          |
| **Halaman baru** | Tanpa tombol Edit di `[id]/page.tsx`                   | Tombol **Kembali ke {Features}** di header |

View hanya menampilkan detail memakai `dl` + komponen `DetailRow`:

```tsx
function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-6">
      <dt className="w-28 shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{children}</dd>
    </div>
  )
}
```

Create dan edit tetap punya footer form (Batal + submit).

---

# Bagian E - Empat pola create/edit/view

## E.1 Pola Halaman baru

```
src/app/{features}/
├── page.tsx  loading.tsx  error.tsx  actions.ts  queries.ts
├── new/page.tsx
├── [id]/page.tsx
├── [id]/not-found.tsx
├── [id]/edit/page.tsx
└── components/{feature}-form.tsx  {feature}-row-actions.tsx  {feature}-workspace.tsx
```

- Sukses mutasi: `revalidatePath()` lalu `redirect()` — **di luar** `try`.
- `get{Feature}ById` dibungkus `React.cache()` supaya `generateMetadata` dan page berbagi satu query.
- `[id]/page.tsx` memanggil `notFound()` bila baris tidak ada; `[id]/not-found.tsx` merender pesannya.
- Nama di baris tabel = `Link` ke `/{features}/{id}`. Edit hanya dari kolom aksi.
- Tombol Create di header = `Link` ke `/{features}/new`.
- Jangan pakai Dialog/Sheet/panel untuk create/edit/view.

**`Button` yang merender `Link`:** Base UI `Button` default `nativeButton={true}`. Merender `<a>` tanpa membaliknya akan menghilangkan semantik `role="button"` dan memunculkan warning:

```tsx
<Button nativeButton={false} render={<Link href="/{features}/new" />}>
  <PlusIcon data-icon="inline-start" />
  {Feature} baru
</Button>
```

`<Button disabled render={<Link/>}>` menghasilkan `<a disabled>` yang **diabaikan browser** — untuk link-button yang harus mati, render `<button disabled>` polos.

## E.2 Pola Dialog

```
src/app/{features}/
├── page.tsx  loading.tsx  error.tsx  actions.ts  queries.ts
└── components/
    ├── {feature}-workspace.tsx     # "use client" — state + kolom + tabel
    ├── {feature}-form-dialog.tsx
    ├── {feature}-view-dialog.tsx
    ├── {feature}-form.tsx
    └── {feature}-row-actions.tsx
```

Jangan buat `new/` atau `[id]/`.

State di workspace client:

```tsx
type {Feature}Dialog =
  | { type: "closed" }
  | { type: "create" }
  | { type: "edit"; row: {Feature} }
  | { type: "view"; row: {Feature} }

const [dialog, setDialog] = React.useState<{Feature}Dialog>({ type: "closed" })
```

- `DialogTitle` **wajib** ada di setiap dialog (accessibility).
- `DialogContent` pakai `className="max-h-[90vh] overflow-y-auto sm:max-w-md"` supaya form panjang tetap bisa di-scroll.
- Dialog edit wajib `key={row.id}` supaya `defaultValue` ikut berganti saat pindah baris.
- Sukses: `revalidatePath` + `{ ok: true }`, **tanpa** `redirect()`. Client menutup dialog.
- Tombol Create di header (dan di empty state) memanggil `setDialog({ type: "create" })` — bukan `Link` ke `/new`.
- Mode view memakai data baris yang sudah ada di list. Jangan fetch halaman detail terpisah.

## E.3 Pola Sheet

Struktur file sama dengan Dialog, hanya nama komponennya `{feature}-form-sheet.tsx` / `{feature}-view-sheet.tsx`.

- Overlay `Sheet` + `SheetContent side="right"`. `SheetTitle` wajib.
- Sheet bersifat **modal**: overlay menutupi halaman, panel fixed ke viewport kanan, list di belakang tidak bisa diklik. Pilih ini bila user ingin fokus penuh pada form.
- Kelas layout yang konsisten: content `gap-0 overflow-y-auto p-0 sm:max-w-md`, header `gap-1 border-b px-4 py-4 pr-12 text-left` (`pr-12` memberi ruang untuk tombol X bawaan), body `flex flex-col gap-4 p-4`.
- Footer `border-t` hanya untuk create/edit; mode view tanpa footer.
- Sukses: `revalidatePath` + `{ ok: true }`, tanpa `redirect()`.
- **Jangan ubah** `src/components/ui/sheet.tsx` — itu komponen shadcn bersama.

## E.4 Pola Panel inline

```
src/app/{features}/
├── page.tsx  loading.tsx  error.tsx  actions.ts  queries.ts
└── components/
    ├── {feature}-side-panel.tsx    # primitif layout LOKAL, bukan Sheet
    ├── {feature}-sheets.tsx        # wrapper: swap isi panel per mode
    ├── {feature}-workspace.tsx
    ├── {feature}-form.tsx
    └── {feature}-row-actions.tsx
```

**Bukan** Sheet. Buat primitif lokal `{feature}-side-panel.tsx` yang hidup di dalam area konten layout, bukan di-portal ke viewport:

| Export                          | Peran                                                    |
| ------------------------------- | -------------------------------------------------------- |
| `{Feature}SidePanelLayout`      | `open`, `panel`, `children` — **membungkus** konten list  |
| `{Feature}SidePanelHeader`      | `onClose` (merender tombol X di kanan atas)               |
| `{Feature}SidePanelTitle`       | judul                                                     |
| `{Feature}SidePanelDescription` | deskripsi muted                                           |
| `{Feature}SidePanelBody`        | area scroll `flex-1`                                      |
| `{Feature}SidePanelFooter`      | hanya create/edit, **bukan** view                         |

Perbedaan struktural dari Dialog/Sheet: layout **membungkus** konten list, jadi JSX-nya bersarang:

```tsx
<{Feature}SidePanelLayout open={sheet.type !== "closed"} panel={panel}>
  <div className="flex min-h-0 flex-1 flex-col gap-6 p-4">
    {/* seluruh isi list */}
  </div>
</{Feature}SidePanelLayout>
```

Aturan khusus:

- Container list memakai `min-h-0 flex-1` (bukan `h-full`) supaya grid menyusut dengan benar. Kolom list `min-w-0 flex-1`.
- Panel hanya menempati `{children}` dari `AppLayout` — **breadcrumb tetap penuh lebar**. Padding di kolom list saja.
- Non-modal: list (cari, pagination, baris lain) tetap bisa diklik saat panel terbuka. Klik di luar panel **tidak** menutup — hanya X atau Batal.
- Animasi hanya untuk lebar buka/tutup. **Jangan** menambah fade saat berganti mode (create ↔ edit ↔ view) — konten berganti langsung.
- **Jangan ubah** `src/components/ui/sheet.tsx`, dan jangan portal/`fixed` ke viewport. Kalau butuh kemampuan baru, perluas primitif lokal.

## E.5 Perbandingan Sheet versus Panel inline

|                             | Sheet                           | Panel inline                                |
| --------------------------- | ------------------------------- | ------------------------------------------- |
| Komponen                    | `@/components/ui/sheet` (shared)| `{feature}-side-panel.tsx` (lokal)          |
| Posisi                      | Fixed portal, overlay viewport  | Inline di area konten layout                |
| Header app / breadcrumb     | Tertutup overlay                | Tetap penuh lebar                           |
| Body list                   | Lebar penuh di belakang overlay | Menyusut jadi 2 kolom                       |
| Interaksi list saat terbuka | Diblokir overlay                | Tetap bisa (cari, pagination, baris lain)   |
| Tutup dengan klik luar      | Bisa                            | Tidak — hanya tombol eksplisit              |
| Struktur JSX                | Sibling setelah konten list     | **Membungkus** konten list                  |

---

# Bagian F - Navigasi

Sidebar dirender dari tabel `menus`: tambah baris lewat `/menus` dan di `src/db/seed.ts` (`routeName: "/{features}"`, `icon` = nama ikon lucide-react). Nama ikon baru didaftarkan di peta `ICONS` `src/components/app-sidebar.tsx`. Tidak ada `app-header.tsx` terpisah di proyek ini.

---

# Bagian G - Base UI, bukan Radix

shadcn di repo ini berjalan di atas **Base UI**. Beda API-nya menjatuhkan kode yang disalin dari contoh Radix, dan sebagian **lolos typecheck**:

| Radix                                     | Base UI                              | Catatan                                                       |
| ----------------------------------------- | ------------------------------------ | ------------------------------------------------------------- |
| `<Trigger asChild><Button/></Trigger>`    | `<Trigger render={<Button/>}>`       | isi tombol jadi children si trigger                            |
| `onCloseAutoFocus={(e) => e.preventDefault()}` | `finalFocus={false}`            | di `DropdownMenuContent`                                       |
| `<DropdownMenuItem onSelect={…}>`         | `onClick={…}`                        | **diam-diam rusak**: `onSelect` DOM = seleksi teks, bukan menu |
| `data-[state=open]:…`                     | `aria-expanded:…`                    | Base UI tidak menulis `data-state` di trigger                  |
| `--radix-popover-trigger-width`           | `--anchor-width`                     | CSS var positioner                                             |

`DropdownMenuItem` sudah default `nativeButton={false}`, jadi `render={<Link/>}` aman tanpa prop tambahan. Yang butuh `nativeButton={false}` hanya `Button`.

---

# Bagian H - Verifikasi

```bash
npx tsc --noEmit
npm run lint
npm run build     # rute yang query DB harus ƒ, bukan ○
```

**Tidak ada test runner** di repo ini — tidak ada file test, tidak ada dependensi test, tidak ada script `test`. Jangan scaffold `*.test.ts` atau mengasumsikan Vitest/Jest/Pest. Kalau tes dibutuhkan, pasang runner-nya dulu.

`next build` adalah pemeriksaan yang menentukan untuk boundary Client Component: `"use client"` yang hilang lolos dari `tsc` tapi menggagalkan build.

Verifikasi HTTP:

- `GET /{features}` → 200
- Pola overlay: `GET /{features}/new` dan `GET /{features}/{uuid}` → **404** (route-nya memang tidak dibuat)
- List: cari, sort, pindah halaman → URL berubah, baris ikut berubah, tombol Back mengembalikan state
- Kembali ke halaman 1 menghapus param `page` dari URL

Kalau UI berubah, buka halamannya dan jalankan create/view/edit/delete. Panel inline: pastikan list menyusut, breadcrumb tetap penuh lebar, dan klik di luar panel tidak menutupnya.

---

# Checklist sebelum selesai

- [ ] Pola UI create/edit/view **ditanyakan** dan dijawab user
- [ ] Schema punya `createdAt`, kolom unique `.unique()`, index untuk kolom sort/filter
- [ ] Kolom multi-kata memakai argumen snake_case eksplisit
- [ ] `export * from "./{table}"` ada di `src/db/schema/index.ts`
- [ ] SQL hasil `db:generate` sudah dibaca sebelum `db:migrate`
- [ ] `queries.ts` diawali `import "server-only"`; `actions.ts` diawali `"use server"`
- [ ] Tidak ada `db.select()` inline di `page.tsx`
- [ ] Definisi kolom ada di Client Component, bukan di Server Component
- [ ] `export const dynamic = "force-dynamic"` di page yang query DB
- [ ] `loading.tsx` + `error.tsx` (prop `retry`)
- [ ] `redirect()` dipanggil di luar `try` — dan tidak dipakai pada pola overlay
- [ ] `isUniqueViolation` mengubah bentrok unique jadi field error, bukan 500
- [ ] Delete memakai `AlertDialog`, dirender sebagai saudara menu
- [ ] Mode view tanpa tombol Edit/Close
- [ ] Baris menu ditambahkan (`/menus` + `src/db/seed.ts`); ikon baru terdaftar di `ICONS` `app-sidebar.tsx`
- [ ] `tsc` bersih, `lint` bersih, `build` sukses dengan rute `ƒ`

# Jangan

- Mengasumsikan pola create/edit/view tanpa menanya (kecuali user sudah memilih)
- Membuat `new/` / `[id]/` untuk pola Dialog / Sheet / Panel inline — atau sebaliknya, memakai overlay untuk pola Halaman baru
- Mencampur dua pola di satu fitur
- Mendefinisikan kolom tabel di Server Component
- Menulis tangan helper sort/search/pagination di halaman list — itu tugas `data-table` / `data-grid`
- Menggambar `<Empty>` manual — komponen tabel sudah punya prop empty state
- `redirect()` pada sukses Dialog / Sheet / panel inline
- `redirect()` di dalam blok `try`
- Memakai Sheet untuk panel inline, atau sebaliknya
- Mengubah `src/components/ui/sheet.tsx` saat mengerjakan panel inline
- Menambah tombol Edit atau Close di footer view
- Query Drizzle di `page.tsx` atau membuat `src/db/queries/` global
- Menulis `interface {Feature}` tangan alih-alih `$inferSelect`
- `useMemo` / `useCallback` / `memo` untuk performa — React Compiler sudah nyala
- Menghapus pola cache `globalThis` di `src/db/index.ts` (hot reload akan membocorkan koneksi Postgres)
- Menyalin `asChild` / `onSelect` / `onCloseAutoFocus` dari contoh Radix
- Scaffold file test atau mengasumsikan test runner
