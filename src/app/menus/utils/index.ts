import type { MenuListParams } from "../types"

export const MENUS_PAGE_SIZE = 10

export const MENUS_DEFAULT_SORT = "sort_order"
export const MENUS_DEFAULT_DIRECTION = "asc" as const

/** Kolom yang boleh dipakai `?sort=` — whitelist, bukan nama kolom bebas. */
export const MENU_SORTABLE_KEYS = [
  "name",
  "slug",
  "level",
  "sort_order",
  "layout",
  "created_at",
] as const

function toArray(value: string | string[] | undefined): string[] {
  if (value === undefined) return []

  return Array.isArray(value) ? value : [value]
}

export function parseMenuListParams(searchParams: {
  [key: string]: string | string[] | undefined
}): MenuListParams {
  const search =
    typeof searchParams.search === "string" ? searchParams.search.trim() : ""

  const sortParam =
    typeof searchParams.sort === "string" ? searchParams.sort : ""
  const sort = (MENU_SORTABLE_KEYS as readonly string[]).includes(sortParam)
    ? sortParam
    : MENUS_DEFAULT_SORT

  const requestedPage = Number(
    typeof searchParams.page === "string" ? searchParams.page : "1",
  )
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1

  return {
    search,
    layouts: toArray(searchParams.layout),
    status: toArray(searchParams.status),
    sort,
    direction: searchParams.direction === "desc" ? "desc" : "asc",
    page,
    perPage: MENUS_PAGE_SIZE,
  }
}

/**
 * Membangun URL list dari state saat ini. Dipakai untuk redirect saat `page`
 * melewati `last_page` (mis. setelah baris terakhir dihapus).
 */
export function buildMenusHref(params: Partial<MenuListParams>): string {
  const query = new URLSearchParams()

  if (params.search) query.set("search", params.search)
  params.layouts?.forEach((layout) => query.append("layout", layout))
  params.status?.forEach((status) => query.append("status", status))
  if (params.sort && params.sort !== MENUS_DEFAULT_SORT) {
    query.set("sort", params.sort)
  }
  if (params.direction && params.direction !== MENUS_DEFAULT_DIRECTION) {
    query.set("direction", params.direction)
  }
  if (params.page && params.page > 1) query.set("page", String(params.page))

  const search = query.toString()

  return search ? `/menus?${search}` : "/menus"
}
