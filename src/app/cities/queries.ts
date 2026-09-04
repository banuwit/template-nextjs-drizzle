import "server-only"

import { count, desc, ilike, or, type SQL } from "drizzle-orm"

import { db } from "@/db"
import { cities, type City } from "@/db/schema"

import type { CityListParams } from "./types"
import { CITIES_PAGE_SIZE } from "./utils"

export type CityListResult = {
  rows: City[]
  total: number
  pageCount: number
  offset: number
}

export async function listCities({
  q,
  page,
}: CityListParams): Promise<CityListResult> {
  const where: SQL | undefined = q
    ? or(ilike(cities.name, `%${q}%`), ilike(cities.code, `%${q}%`))
    : undefined

  const offset = (page - 1) * CITIES_PAGE_SIZE

  const [rows, [totals]] = await Promise.all([
    db
      .select()
      .from(cities)
      .where(where)
      .orderBy(desc(cities.createdAt), desc(cities.id))
      .limit(CITIES_PAGE_SIZE)
      .offset(offset),
    db.select({ value: count() }).from(cities).where(where),
  ])

  const total = totals?.value ?? 0

  return {
    rows,
    total,
    pageCount: Math.max(1, Math.ceil(total / CITIES_PAGE_SIZE)),
    offset,
  }
}
