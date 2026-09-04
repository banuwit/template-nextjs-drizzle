import type { CountryListParams } from "../types"

export const COUNTRIES_PAGE_SIZE = 10

export function parseCountryListParams(searchParams: {
  [key: string]: string | string[] | undefined
}): CountryListParams {
  const search =
    typeof searchParams.search === "string" ? searchParams.search.trim() : ""
  const requestedPage = Number(
    typeof searchParams.page === "string" ? searchParams.page : "1"
  )
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1

  return { search, page }
}

export function buildCountriesHref({
  page,
  search,
}: CountryListParams): string {
  const params = new URLSearchParams()

  if (search) params.set("search", search)
  if (page > 1) params.set("page", String(page))

  const query = params.toString()

  return query ? `/countries?${query}` : "/countries"
}
