import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { AppLayout } from "@/components/layouts/app-layout"

import { ProvincePagination } from "./components/province-pagination"
import { ProvinceSearchForm } from "./components/province-search-form"
import { ProvinceWorkspace } from "./components/province-workspace"
import { listProvinces } from "./queries"
import { buildProvincesHref, parseProvinceListParams } from "./utils"

export const metadata: Metadata = {
  title: "Provinces",
}

export const dynamic = "force-dynamic"

export default async function ProvincesPage({
  searchParams,
}: PageProps<"/provinces">) {
  const { q, page } = parseProvinceListParams(await searchParams)
  const { rows, total, pageCount, offset } = await listProvinces({ q, page })

  if (page > pageCount) {
    redirect(buildProvincesHref({ q, page: pageCount }))
  }

  return (
    <AppLayout breadcrumbs={[{ label: "Provinces" }]}>
      <div className="flex h-full flex-1 flex-col gap-6 p-4">
        <ProvinceWorkspace
          provinces={rows}
          offset={offset}
          emptyMessage={
            q
              ? `Tidak ada provinsi yang cocok dengan "${q}".`
              : "Belum ada provinsi."
          }
          search={<ProvinceSearchForm q={q} />}
          pagination={
            <ProvincePagination
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
