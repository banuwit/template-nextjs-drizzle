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
  const { q, page } = parseCountryListParams(await searchParams)
  const { rows, total, pageCount, offset } = await listCountries({ q, page })

  if (page > pageCount) {
    redirect(buildCountriesHref({ q, page: pageCount }))
  }

  return (
    <AppLayout breadcrumbs={[{ label: "Countries" }]}>
      <div className="flex h-full flex-1 flex-col gap-6 p-4">
        <CountryWorkspace
          countries={rows}
          offset={offset}
          emptyMessage={
            q
              ? `Tidak ada negara yang cocok dengan "${q}".`
              : "Belum ada negara."
          }
          search={<CountrySearchForm q={q} />}
          pagination={
            <CountryPagination
              page={page}
              pageCount={pageCount}
              total={total}
              q={q}
            />
          }
        />
      </div>
    </AppLayout>
  )
}
