import "server-only"

import { cache } from "react"
import { count, desc, eq, ilike, or, type SQL } from "drizzle-orm"

import { db } from "@/db"
import { users, type User } from "@/db/schema"

import type { UserListParams } from "./types"
import { USERS_PAGE_SIZE } from "./utils"

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

export type UserListResult = {
  rows: User[]
  total: number
  pageCount: number
  offset: number
}

/** Satu halaman user beserta total baris, untuk tabel + pagination. */
export async function listUsers({
  q,
  page,
}: UserListParams): Promise<UserListResult> {
  const where: SQL | undefined = q
    ? or(ilike(users.name, `%${q}%`), ilike(users.email, `%${q}%`))
    : undefined

  const offset = (page - 1) * USERS_PAGE_SIZE

  const [rows, [totals]] = await Promise.all([
    db
      .select()
      .from(users)
      .where(where)
      .orderBy(desc(users.createdAt), desc(users.id))
      .limit(USERS_PAGE_SIZE)
      .offset(offset),
    db.select({ value: count() }).from(users).where(where),
  ])

  const total = totals?.value ?? 0

  return {
    rows,
    total,
    pageCount: Math.max(1, Math.ceil(total / USERS_PAGE_SIZE)),
    offset,
  }
}
