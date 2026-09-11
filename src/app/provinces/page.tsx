import type { Metadata } from "next"

import { AppLayout } from "@/components/layouts/app-layout"

import { ProvinceWorkspace } from "./components/province-workspace"
import { listProvinces } from "./queries"

export const metadata: Metadata = {
  title: "Provinces",
}

export const dynamic = "force-dynamic"

export default async function ProvincesPage() {
  // `DataTableClient` menyaring/mengurutkan/mem-paginasi di browser, jadi
  // seluruh baris (bukan satu halaman) diambil sekali di sini.
  const provinces = await listProvinces()

  return (
    <AppLayout breadcrumbs={[{ label: "Provinces" }]}>
      <div className="flex h-full min-w-0 flex-1 flex-col gap-6 p-4">
        <ProvinceWorkspace provinces={provinces} />
      </div>
    </AppLayout>
  )
}
