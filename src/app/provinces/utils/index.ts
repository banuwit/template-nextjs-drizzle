import type { ProvinceListParams } from "../types"

export const PROVINCES_PAGE_SIZE = 10

export function parseProvinceListParams(searchParams: {
  [key: string]: string | string[] | undefined
}): ProvinceListParams {
  const search =
    typeof searchParams.search === "string" ? searchParams.search.trim() : ""
  const requestedPage = Number(
    typeof searchParams.page === "string" ? searchParams.page : "1"
  )
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1

  return { search, page }
}

export function buildProvincesHref({
  page,
  search,
}: ProvinceListParams): string {
  const params = new URLSearchParams()

  if (search) params.set("search", search)
  if (page > 1) params.set("page", String(page))

  const query = params.toString()

  return query ? `/provinces?${query}` : "/provinces"
}
