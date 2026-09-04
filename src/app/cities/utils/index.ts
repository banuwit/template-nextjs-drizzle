import type { CityListParams } from "../types"

export const CITIES_PAGE_SIZE = 10

export function parseCityListParams(searchParams: {
  [key: string]: string | string[] | undefined
}): CityListParams {
  const q = typeof searchParams.q === "string" ? searchParams.q.trim() : ""
  const requestedPage = Number(
    typeof searchParams.page === "string" ? searchParams.page : "1"
  )
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1

  return { q, page }
}

export function buildCitiesHref({ page, q }: CityListParams): string {
  const params = new URLSearchParams()

  if (q) params.set("q", q)
  if (page > 1) params.set("page", String(page))

  const query = params.toString()

  return query ? `/cities?${query}` : "/cities"
}
