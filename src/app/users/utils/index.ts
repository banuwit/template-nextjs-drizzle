import type { UserListParams } from "../types"

/** Jumlah baris per halaman di list user. */
export const USERS_PAGE_SIZE = 10

/**
 * Baca query string list user. Nilai yang tidak masuk akal (page = 0, "abc",
 * array) jatuh ke default supaya query DB tidak pernah menerima offset negatif.
 */
export function parseUserListParams(searchParams: {
  [key: string]: string | string[] | undefined
}): UserListParams {
  const q = typeof searchParams.q === "string" ? searchParams.q.trim() : ""
  const requestedPage = Number(
    typeof searchParams.page === "string" ? searchParams.page : "1"
  )
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1

  return { q, page }
}

/** URL list user; filter `q` ikut terbawa saat pindah halaman. */
export function buildUsersHref({ page, q }: UserListParams): string {
  const params = new URLSearchParams()

  if (q) params.set("q", q)
  if (page > 1) params.set("page", String(page))

  const query = params.toString()

  return query ? `/users?${query}` : "/users"
}
