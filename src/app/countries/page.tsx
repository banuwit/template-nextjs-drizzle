import type { Metadata } from "next"

import { AppLayout } from "@/components/layouts/app-layout"

import { CountryWorkspace } from "./components/country-workspace"
import { listCountries } from "./queries"

export const metadata: Metadata = {
  title: "Countries",
}

export const dynamic = "force-dynamic"

export default async function CountriesPage() {
  // `DataTableClient` menyaring/mengurutkan/mem-paginasi di browser, jadi
  // seluruh baris (bukan satu halaman) diambil sekali di sini.
  const countries = await listCountries()

  return (
    <AppLayout breadcrumbs={[{ label: "Countries" }]}>
      <div className="flex h-full flex-1 flex-col gap-6 p-4">
        <CountryWorkspace countries={countries} />
      </div>
    </AppLayout>
  )
}
