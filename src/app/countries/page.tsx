import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { AppLayout } from "@/components/layouts/app-layout"

import { CountryPagination } from "./components/country-pagination"
import { CountrySearchForm } from "./components/country-search-form"
import { CountryWorkspace } from "./components/country-workspace"
import { listCountries } from "./queries"
import { buildCountriesHref, parseCountryListParams } from "./utils"

export const metadata: Metadata = {
  title: "Countries",
}

export const dynamic = "force-dynamic"

export default async function CountriesPage({
  searchParams,
}: PageProps<"/countries">) {
  const { search, page } = parseCountryListParams(await searchParams)
  const { rows, total, pageCount, offset } = await listCountries({
    search,
    page,
  })

  if (page > pageCount) {
    redirect(buildCountriesHref({ search, page: pageCount }))
  }

  return (
    <AppLayout breadcrumbs={[{ label: "Countries" }]}>
      <div className="flex h-full flex-1 flex-col gap-6 p-4">
        <CountryWorkspace
          countries={rows}
          offset={offset}
          emptyMessage={
            search
              ? `Tidak ada negara yang cocok dengan "${search}".`
              : "Belum ada negara."
          }
          search={<CountrySearchForm search={search} />}
          pagination={
            <CountryPagination
              page={page}
              pageCount={pageCount}
              total={total}
              search={search}
            />
          }
        />
      </div>
    </AppLayout>
  )
}
