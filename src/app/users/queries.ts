import "server-only"

import { cache } from "react"
import {
  asc,
  count,
  and,
  desc,
  eq,
  ilike,
  isNull,
  type AnyColumn,
} from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db"
import { users, type User } from "@/db/schema"
import { paginate } from "@/lib/pagination"
import { requireUser } from "@/lib/session"
import type { Paginated } from "@/types/pagination"

import type { UserListParams, UserSortColumn } from "./types"

/**
 * Ambil satu user berdasarkan uuid dari URL; `undefined` kalau bukan uuid,
 * tidak ada, atau sudah di-soft-delete. Validasi format dulu: Postgres
 * melempar error (bukan "tidak ketemu") untuk teks yang bukan uuid.
 */
export const getUserById = cache(
  async (rawId: string): Promise<User | undefined> => {
    await requireUser()

    const id = z.uuid().safeParse(rawId)

    if (!id.success) {
      return undefined
    }

    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, id.data), isNull(users.deletedAt)))
      .limit(1)

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
  await requireUser()

  const where = and(
    isNull(users.deletedAt),
    search ? ilike(users.name, `%${search}%`) : undefined
  )

  const column = sortable[sort]
  const order = direction === "asc" ? asc(column) : desc(column)

  const [rows, [totals]] = await Promise.all([
    db
      .select()
      .from(users)
      .where(where)
      // Tie-breaker menjaga urutan tetap stabil saat nilai kolom sort sama.
      .orderBy(order, desc(users.internalId))
      .limit(perPage)
      .offset((page - 1) * perPage),
    db.select({ value: count() }).from(users).where(where),
  ])

  return paginate({ rows, total: totals?.value ?? 0, page, perPage })
}
