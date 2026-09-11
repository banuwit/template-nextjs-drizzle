import "server-only"

import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  ilike,
  isNull,
  or,
  sql,
  type SQL,
} from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"

import { db } from "@/db"
import { menus, type Menu } from "@/db/schema"
import { paginate } from "@/lib/pagination"
import { requireUser } from "@/lib/session"
import type { Paginated } from "@/types/pagination"

import type { MenuListParams, MenuListRow, MenuParentOption } from "./types"

/**
 * Tidak ada global scope seperti SoftDeletes di Eloquent: setiap query di file
 * ini harus menyertakan `isNull(menus.deletedAt)` sendiri.
 */
const notDeleted = isNull(menus.deletedAt)

/** Alias tabel yang sama, dipakai untuk mengambil nama induk lewat self-join. */
const parents = alias(menus, "parents")

const sortable = {
  name: menus.name,
  slug: menus.slug,
  level: menus.level,
  sort_order: menus.sortOrder,
  layout: menus.layout,
  created_at: menus.createdAt,
} as const

export async function listMenus({
  search,
  layouts,
  status,
  sort,
  direction,
  page,
  perPage,
}: MenuListParams): Promise<Paginated<MenuListRow>> {
  await requireUser()

  const clauses: SQL[] = [notDeleted]

  if (search) {
    clauses.push(ilike(menus.name, `%${search}%`))
  }

  if (layouts.length > 0) {
    const match = or(...layouts.map((layout) => eq(menus.layout, layout)))
    if (match) clauses.push(match)
  }

  // Facet status: `active` / `inactive` / `root` (menu tanpa induk).
  if (status.length > 0) {
    const match = or(
      ...status.flatMap((entry) => {
        if (entry === "active") return [eq(menus.isActive, true)]
        if (entry === "inactive") return [eq(menus.isActive, false)]
        if (entry === "root") return [isNull(menus.parentId)]

        return []
      }),
    )
    if (match) clauses.push(match)
  }

  const where = and(...clauses)
  const column = sortable[sort as keyof typeof sortable] ?? menus.sortOrder
  const order = direction === "asc" ? asc(column) : desc(column)

  const [rows, [totals]] = await Promise.all([
    db
      .select({ ...getTableColumns(menus), parentName: parents.name })
      .from(menus)
      // Induk yang sudah di-soft-delete tidak dianggap ada, jadi ikut difilter
      // di kondisi join — bukan di WHERE, supaya barisnya sendiri tidak hilang.
      .leftJoin(
        parents,
        and(eq(menus.parentId, parents.id), isNull(parents.deletedAt)),
      )
      .where(where)
      .orderBy(order, asc(menus.internalId))
      .limit(perPage)
      .offset((page - 1) * perPage),
    db.select({ value: count() }).from(menus).where(where),
  ])

  return paginate({ rows, total: totals?.value ?? 0, page, perPage })
}

/** Layout yang benar-benar dipakai, untuk opsi facet dan datalist form. */
export async function listMenuLayouts(): Promise<string[]> {
  await requireUser()

  const rows = await db
    .selectDistinct({ layout: menus.layout })
    .from(menus)
    .where(notDeleted)
    .orderBy(asc(menus.layout))
    .limit(50)

  return rows.map((row) => row.layout).filter(Boolean)
}

/**
 * Kandidat induk untuk dropdown form, urut mengikuti hierarki supaya bisa
 * diindentasi. Semua menu ikut dikirim; penyaringan "tidak boleh jadi induk
 * dirinya sendiri / turunannya" dilakukan di client dan divalidasi ulang di
 * `actions.ts`.
 */
export async function listMenuParentOptions(): Promise<MenuParentOption[]> {
  await requireUser()

  const rows = await db
    .select({
      id: menus.id,
      name: menus.name,
      level: menus.level,
      parentId: menus.parentId,
      sortOrder: menus.sortOrder,
    })
    .from(menus)
    .where(notDeleted)
    .orderBy(asc(menus.sortOrder), asc(menus.internalId))

  const childrenOf = new Map<string | null, typeof rows>()

  rows.forEach((row) => {
    const siblings = childrenOf.get(row.parentId) ?? []
    siblings.push(row)
    childrenOf.set(row.parentId, siblings)
  })

  const ordered: MenuParentOption[] = []

  function walk(parentId: string | null, depth: number) {
    for (const row of childrenOf.get(parentId) ?? []) {
      ordered.push({
        id: row.id,
        name: row.name,
        level: depth,
        parentId: row.parentId,
      })
      walk(row.id, depth + 1)
    }
  }

  walk(null, 0)

  // Baris yatim (induknya sudah dihapus) tidak akan terjangkau `walk`, tapi
  // tetap kandidat induk yang sah — jadi ditambahkan di belakang.
  const seen = new Set(ordered.map((option) => option.id))
  rows.forEach((row) => {
    if (!seen.has(row.id)) {
      ordered.push({
        id: row.id,
        name: row.name,
        level: 0,
        parentId: row.parentId,
      })
    }
  })

  return ordered
}

/** Urutan berikutnya dalam satu layout, dipakai sebagai default form create. */
export async function nextMenuSortOrder(): Promise<number> {
  await requireUser()

  const [row] = await db
    .select({ max: sql<number | null>`max(${menus.sortOrder})` })
    .from(menus)
    .where(notDeleted)

  return (row?.max ?? -1) + 1
}

export type MenuTreeNode = Menu & { children: MenuTreeNode[] }

/**
 * Menu aktif satu layout dalam bentuk pohon — bentuk yang dibutuhkan
 * `app-sidebar.tsx` saat sidebar nanti dipindah ke database. Belum dipakai
 * halaman mana pun; disediakan supaya konsumen tidak menulis query sendiri.
 */
export async function listMenuTree(layout = "sidebar"): Promise<MenuTreeNode[]> {
  await requireUser()

  const rows = await db
    .select()
    .from(menus)
    .where(and(notDeleted, eq(menus.isActive, true), eq(menus.layout, layout)))
    .orderBy(asc(menus.sortOrder), asc(menus.internalId))

  const nodes = new Map<string, MenuTreeNode>(
    rows.map((row) => [row.id, { ...row, children: [] }]),
  )
  const roots: MenuTreeNode[] = []

  nodes.forEach((node) => {
    const parent = node.parentId === null ? undefined : nodes.get(node.parentId)

    // Induk yang nonaktif / beda layout / terhapus tidak ada di map, jadi
    // anaknya diperlakukan sebagai root daripada hilang dari sidebar.
    if (parent) {
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

/**
 * Id menu itu sendiri beserta seluruh turunannya. Dipakai untuk mencegah
 * siklus induk dan untuk ikut menghapus anak saat induknya dihapus.
 *
 * Ditelusuri di memori, bukan lewat recursive CTE: tabel menu berukuran puluhan
 * baris dan ini jauh lebih mudah dibaca.
 */
export async function listMenuSubtreeIds(id: string): Promise<string[]> {
  await requireUser()

  const rows = await db
    .select({ id: menus.id, parentId: menus.parentId })
    .from(menus)
    .where(notDeleted)

  const childrenOf = new Map<string, string[]>()

  rows.forEach((row) => {
    if (row.parentId === null) return
    childrenOf.set(row.parentId, [
      ...(childrenOf.get(row.parentId) ?? []),
      row.id,
    ])
  })

  // Id yang tidak ada (atau sudah ter-soft-delete) menghasilkan array kosong,
  // sehingga pemanggilnya bisa membedakan "tidak ketemu" dari "daun tanpa anak".
  if (!rows.some((row) => row.id === id)) {
    return []
  }

  const collected: string[] = []
  const queue = [id]

  while (queue.length > 0) {
    const current = queue.shift() as string

    if (collected.includes(current)) continue

    collected.push(current)
    queue.push(...(childrenOf.get(current) ?? []))
  }

  return collected
}

/** Level induk, untuk menurunkan `level` baris anak. */
export async function getMenuLevel(id: string): Promise<number | null> {
  await requireUser()

  const [row] = await db
    .select({ level: menus.level })
    .from(menus)
    .where(and(eq(menus.id, id), notDeleted))
    .limit(1)

  return row?.level ?? null
}
