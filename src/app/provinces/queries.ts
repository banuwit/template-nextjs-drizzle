import "server-only"

import { count, desc, ilike, or, type SQL } from "drizzle-orm"

import { db } from "@/db"
import { provinces, type Province } from "@/db/schema"

import type { ProvinceListParams } from "./types"
import { PROVINCES_PAGE_SIZE } from "./utils"

export type ProvinceListResult = {
  rows: Province[]
  total: number
  pageCount: number
  offset: number
}

export async function listProvinces({
  search,
  page,
}: ProvinceListParams): Promise<ProvinceListResult> {
  const where: SQL | undefined = search
    ? or(
        ilike(provinces.name, `%${search}%`),
        ilike(provinces.code, `%${search}%`)
      )
    : undefined

  const offset = (page - 1) * PROVINCES_PAGE_SIZE

  const [rows, [totals]] = await Promise.all([
    db
      .select()
      .from(provinces)
      .where(where)
      .orderBy(desc(provinces.createdAt), desc(provinces.id))
      .limit(PROVINCES_PAGE_SIZE)
      .offset(offset),
    db.select({ value: count() }).from(provinces).where(where),
  ])

  const total = totals?.value ?? 0

  return {
    rows,
    total,
    pageCount: Math.max(1, Math.ceil(total / PROVINCES_PAGE_SIZE)),
    offset,
  }
}
