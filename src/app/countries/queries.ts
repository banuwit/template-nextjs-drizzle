import "server-only"

import { count, desc, ilike, or, type SQL } from "drizzle-orm"

import { db } from "@/db"
import { countries, type Country } from "@/db/schema"

import type { CountryListParams } from "./types"
import { COUNTRIES_PAGE_SIZE } from "./utils"

export type CountryListResult = {
  rows: Country[]
  total: number
  pageCount: number
  offset: number
}

export async function listCountries({
  search,
  page,
}: CountryListParams): Promise<CountryListResult> {
  const where: SQL | undefined = search
    ? or(
        ilike(countries.name, `%${search}%`),
        ilike(countries.code, `%${search}%`)
      )
    : undefined

  const offset = (page - 1) * COUNTRIES_PAGE_SIZE

  const [rows, [totals]] = await Promise.all([
    db
      .select()
      .from(countries)
      .where(where)
      .orderBy(desc(countries.createdAt), desc(countries.id))
      .limit(COUNTRIES_PAGE_SIZE)
      .offset(offset),
    db.select({ value: count() }).from(countries).where(where),
  ])

  const total = totals?.value ?? 0

  return {
    rows,
    total,
    pageCount: Math.max(1, Math.ceil(total / COUNTRIES_PAGE_SIZE)),
    offset,
  }
}
