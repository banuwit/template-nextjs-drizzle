import { USER_SORT_COLUMNS, type UserListParams } from "../types"

/** Jumlah baris per halaman di list user. */
export const USERS_PAGE_SIZE = 10

/** Pilihan pemilih ukuran halaman di grid — harus memuat `USERS_PAGE_SIZE`. */
export const USERS_PER_PAGE_OPTIONS = [10, 25, 50] as const

/**
 * Baca query string list user. Nilai yang tidak masuk akal (page = 0, "abc",
 * sort di luar whitelist, per_page di luar pilihan) jatuh ke default supaya
 * query DB tidak pernah menerima offset negatif atau kolom sort yang tidak ada.
 */
export function parseUserListParams(searchParams: {
  [key: string]: string | string[] | undefined
}): UserListParams {
  const search =
    typeof searchParams.search === "string" ? searchParams.search.trim() : ""
  const requestedPage = Number(
    typeof searchParams.page === "string" ? searchParams.page : "1"
  )
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1

  const requestedSort = searchParams.sort
  const sort =
    typeof requestedSort === "string" &&
    (USER_SORT_COLUMNS as readonly string[]).includes(requestedSort)
      ? (requestedSort as UserListParams["sort"])
      : "created_at"

  const direction = searchParams.direction === "asc" ? "asc" : "desc"

  const requestedPerPage = Number(searchParams.per_page)
  const perPage = (USERS_PER_PAGE_OPTIONS as readonly number[]).includes(
    requestedPerPage
  )
    ? requestedPerPage
    : USERS_PAGE_SIZE

  return { search, page, sort, direction, perPage }
}

/** URL list user; search/sort/direction/per_page ikut terbawa saat pindah halaman. */
export function buildUsersHref({
  page,
  search,
  sort,
  direction,
  perPage,
}: UserListParams): string {
  const params = new URLSearchParams()

  if (search) params.set("search", search)
  if (page > 1) params.set("page", String(page))
  if (sort !== "created_at") params.set("sort", sort)
  if (direction !== "desc") params.set("direction", direction)
  if (perPage !== USERS_PAGE_SIZE) params.set("per_page", String(perPage))

  const query = params.toString()

  return query ? `/users?${query}` : "/users"
}
