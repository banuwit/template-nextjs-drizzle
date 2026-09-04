import "server-only"

import { cache } from "react"
import {
  asc,
  count,
  desc,
  eq,
  ilike,
  or,
  type AnyColumn,
  type SQL,
} from "drizzle-orm"

import { db } from "@/db"
import { users, type User } from "@/db/schema"
import { paginate } from "@/lib/pagination"
import type { Paginated } from "@/types/pagination"

import type { UserListParams, UserSortColumn } from "./types"

/** Ambil satu user; `undefined` kalau id bukan angka atau baris tidak ada. */
export const getUserById = cache(
  async (rawId: string): Promise<User | undefined> => {
    const id = Number(rawId)

    if (!Number.isInteger(id) || id <= 0) {
      return undefined
    }

    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)

    return user
  }
)

/**
 * Kolom yang boleh dipakai untuk sort, dipetakan ke kolom Drizzle-nya.
 * Diketik sebagai `Record<UserSortColumn, AnyColumn>` supaya kolom yang lupa
 * ditambah ke sini (setelah `USER_SORT_COLUMNS` di `types/index.ts` diperluas)
 * langsung ketahuan di typecheck, bukan diam-diam diabaikan saat runtime.
 */
const sortable: Record<UserSortColumn, AnyColumn> = {
  name: users.name,
  email: users.email,
  created_at: users.createdAt,
}

/** Satu halaman user, untuk `DataGridServer`. */
export async function listUsers({
  search,
  page,
  sort,
  direction,
  perPage,
}: UserListParams): Promise<Paginated<User>> {
  const where: SQL | undefined = search
    ? or(ilike(users.name, `%${search}%`), ilike(users.email, `%${search}%`))
    : undefined

  const column = sortable[sort]
  const order = direction === "asc" ? asc(column) : desc(column)

  const [rows, [totals]] = await Promise.all([
    db
      .select()
      .from(users)
      .where(where)
      // Tie-breaker menjaga urutan tetap stabil saat nilai kolom sort sama.
      .orderBy(order, desc(users.id))
      .limit(perPage)
      .offset((page - 1) * perPage),
    db.select({ value: count() }).from(users).where(where),
  ])

  return paginate({ rows, total: totals?.value ?? 0, page, perPage })
}
