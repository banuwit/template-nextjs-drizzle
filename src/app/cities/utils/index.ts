import type { CityListParams } from "../types"

export const CITIES_PAGE_SIZE = 10

export function parseCityListParams(searchParams: {
  [key: string]: string | string[] | undefined
}): CityListParams {
  const search =
    typeof searchParams.search === "string" ? searchParams.search.trim() : ""
  const requestedPage = Number(
    typeof searchParams.page === "string" ? searchParams.page : "1"
  )
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1

  return { search, page }
}

export function buildCitiesHref({ page, search }: CityListParams): string {
  const params = new URLSearchParams()

  if (search) params.set("search", search)
  if (page > 1) params.set("page", String(page))

  const query = params.toString()

  return query ? `/cities?${query}` : "/cities"
}
