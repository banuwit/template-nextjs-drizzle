import type { Metadata } from "next"

import { AppLayout } from "@/components/layouts/app-layout"

import { CityWorkspace } from "./components/city-workspace"
import { listCities } from "./queries"

export const metadata: Metadata = {
  title: "Cities",
}

export const dynamic = "force-dynamic"

export default async function CitiesPage() {
  // `DataTableClient` menyaring/mengurutkan/mem-paginasi di browser, jadi
  // seluruh baris (bukan satu halaman) diambil sekali di sini.
  const cities = await listCities()

  return (
    <AppLayout breadcrumbs={[{ label: "Cities" }]}>
      <div className="flex h-full flex-1 flex-col gap-6 p-4">
        <CityWorkspace cities={cities} />
      </div>
    </AppLayout>
  )
}
