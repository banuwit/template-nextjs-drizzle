import "server-only"

import { and, asc, count, desc, ilike, or, sql, type SQL } from "drizzle-orm"

import { db } from "@/db"
import { users, type User } from "@/db/schema"
import { paginate } from "@/lib/pagination"
import type { Paginated } from "@/types/pagination"

import { EXAMPLE_PAGE_SIZE } from "./constants"

export { EXAMPLE_PAGE_SIZE }

export interface ExampleListParams {
  search: string
  domains: string[]
  sort: string
  direction: "asc" | "desc"
  page: number
  perPage: number
}

const sortable = {
  name: users.name,
  email: users.email,
  created_at: users.createdAt,
} as const

export async function listExampleUsers({
  search,
  domains,
  sort,
  direction,
  page,
  perPage,
}: ExampleListParams): Promise<Paginated<User>> {
  const clauses: SQL[] = []

  if (search) {
    const like = `%${search}%`
    const match = or(ilike(users.name, like), ilike(users.email, like))
    if (match) clauses.push(match)
  }

  if (domains.length > 0) {
    const match = or(
      ...domains.map((domain) => ilike(users.email, `%@${domain}`)),
    )
    if (match) clauses.push(match)
  }

  const where = clauses.length > 0 ? and(...clauses) : undefined
  const column = sortable[sort as keyof typeof sortable] ?? users.createdAt
  const order = direction === "asc" ? asc(column) : desc(column)

  const [rows, [totals]] = await Promise.all([
    db
      .select()
      .from(users)
      .where(where)
      .orderBy(order, desc(users.id))
      .limit(perPage)
      .offset((page - 1) * perPage),
    db.select({ value: count() }).from(users).where(where),
  ])

  return paginate({ rows, total: totals?.value ?? 0, page, perPage })
}

/** Domain email yang benar-benar ada di tabel, dipakai sebagai opsi facet. */
export async function listEmailDomains(): Promise<string[]> {
  const domain = sql<string>`split_part(${users.email}, '@', 2)`

  const rows = await db
    .selectDistinct({ domain })
    .from(users)
    .orderBy(domain)
    .limit(20)

  return rows.map((row) => row.domain).filter(Boolean)
}
