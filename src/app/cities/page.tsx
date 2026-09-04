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
  const { q, page } = parseCityListParams(await searchParams)
  const { rows, total, pageCount, offset } = await listCities({ q, page })

  if (page > pageCount) {
    redirect(buildCitiesHref({ q, page: pageCount }))
  }

  return (
    <AppLayout breadcrumbs={[{ label: "Cities" }]}>
      <div className="flex min-h-0 flex-1 flex-col">
        <CityWorkspace
          cities={rows}
          offset={offset}
          emptyMessage={
            q
              ? `Tidak ada kota yang cocok dengan "${q}".`
              : "Belum ada kota."
          }
          q={q}
          page={page}
          pageCount={pageCount}
          total={total}
        />
      </div>
    </AppLayout>
  )
}
