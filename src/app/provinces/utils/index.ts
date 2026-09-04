import type { ProvinceListParams } from "../types"

export const PROVINCES_PAGE_SIZE = 10

export function parseProvinceListParams(searchParams: {
  [key: string]: string | string[] | undefined
}): ProvinceListParams {
  const q = typeof searchParams.q === "string" ? searchParams.q.trim() : ""
  const requestedPage = Number(
    typeof searchParams.page === "string" ? searchParams.page : "1"
  )
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1

  return { q, page }
}

export function buildProvincesHref({ page, q }: ProvinceListParams): string {
  const params = new URLSearchParams()

  if (q) params.set("q", q)
  if (page > 1) params.set("page", String(page))

  const query = params.toString()

  return query ? `/provinces?${query}` : "/provinces"
}
