import type { CountryListParams } from "../types"

export const COUNTRIES_PAGE_SIZE = 10

export function parseCountryListParams(searchParams: {
  [key: string]: string | string[] | undefined
}): CountryListParams {
  const q = typeof searchParams.q === "string" ? searchParams.q.trim() : ""
  const requestedPage = Number(
    typeof searchParams.page === "string" ? searchParams.page : "1"
  )
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1

  return { q, page }
}

export function buildCountriesHref({ page, q }: CountryListParams): string {
  const params = new URLSearchParams()

  if (q) params.set("q", q)
  if (page > 1) params.set("page", String(page))

  const query = params.toString()

  return query ? `/countries?${query}` : "/countries"
}
