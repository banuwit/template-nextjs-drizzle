import type { Metadata } from "next"

import { AppLayout } from "@/components/layouts/app-layout"

import { ParameterWorkspace } from "./components/parameter-workspace"
import { listAllParameters, listParameterGroups, nextSortOrder } from "./queries"

export const metadata: Metadata = {
  title: "Parameters",
}

// Halaman ini query DB: tanpa ini `next build` akan memprerender dan membekukan hasilnya.
export const dynamic = "force-dynamic"

export default async function ParametersPage() {
  // `DataGridClient` menyaring/mengurutkan/mem-paginasi di browser, jadi
  // seluruh baris (bukan satu halaman) diambil sekali di sini — beda dengan
  // `DataTableServer` yang tadinya membaca `searchParams` dan meminta ulang
  // ke server setiap kali search/sort/page berubah.
  const [parameters, groups, suggestedSortOrder] = await Promise.all([
    listAllParameters(),
    listParameterGroups(),
    nextSortOrder(),
  ])

  return (
    <AppLayout breadcrumbs={[{ label: "Parameters" }]}>
      <div className="flex min-h-0 flex-1 flex-col">
        <ParameterWorkspace
          parameters={parameters}
          groups={groups}
          nextSortOrder={suggestedSortOrder}
        />
      </div>
    </AppLayout>
  )
}
