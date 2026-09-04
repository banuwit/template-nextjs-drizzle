import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { AppLayout } from "@/components/layouts/app-layout"

import { CityWorkspace } from "./components/city-workspace"
import { listCities } from "./queries"
import { buildCitiesHref, parseCityListParams } from "./utils"

export const metadata: Metadata = {
  title: "Cities",
}

export const dynamic = "force-dynamic"

export default async function CitiesPage({
  searchParams,
}: PageProps<"/cities">) {
  const { search, page } = parseCityListParams(await searchParams)
  const { rows, total, pageCount, offset } = await listCities({
    search,
    page,
  })

  if (page > pageCount) {
    redirect(buildCitiesHref({ search, page: pageCount }))
  }

  return (
    <AppLayout breadcrumbs={[{ label: "Cities" }]}>
      <div className="flex min-h-0 flex-1 flex-col">
        <CityWorkspace
          cities={rows}
          offset={offset}
          emptyMessage={
            search
              ? `Tidak ada kota yang cocok dengan "${search}".`
              : "Belum ada kota."
          }
          search={search}
          page={page}
          pageCount={pageCount}
          total={total}
        />
      </div>
    </AppLayout>
  )
}
