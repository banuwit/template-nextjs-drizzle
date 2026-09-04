import type { Metadata } from "next"

import Heading from "@/components/heading"
import { AppLayout } from "@/components/layouts/app-layout"
import { Card, CardContent } from "@/components/ui/card"

import { listEmailDomains, listExampleUsers } from "../data-table/queries"
import { ExampleUserGrid } from "./components/example-user-grid"
import { EXAMPLE_PAGE_SIZE } from "./constants"

export const metadata: Metadata = { title: "Contoh DataGrid" }

export const dynamic = "force-dynamic"

function toArray(value: string | string[] | undefined): string[] {
  if (value === undefined) return []

  return Array.isArray(value) ? value : [value]
}

export default async function ExampleDataGridPage({
  searchParams,
}: PageProps<"/examples/data-grid">) {
  const filters = await searchParams

  const search = typeof filters.search === "string" ? filters.search : ""
  const domains = toArray(filters.domain)
  const sort = typeof filters.sort === "string" ? filters.sort : "created_at"
  const direction = filters.direction === "asc" ? "asc" : "desc"
  const requested = Number(filters.page ?? 1)
  const page = Number.isInteger(requested) && requested > 0 ? requested : 1

  const [paginated, availableDomains] = await Promise.all([
    listExampleUsers({
      search,
      domains,
      sort,
      direction,
      page,
      perPage: EXAMPLE_PAGE_SIZE,
    }),
    listEmailDomains(),
  ])

  return (
    <AppLayout breadcrumbs={[{ label: "Examples" }, { label: "DataGrid" }]}>
      <div className="flex h-full flex-1 flex-col gap-6 p-4">
        <Heading
          variant="small"
          title="Contoh DataGrid"
          description="Halaman sementara untuk memverifikasi port DataGridServer."
        />

        <Card className="gap-0 overflow-hidden py-0">
          <CardContent className="flex flex-col gap-4 p-4">
            <ExampleUserGrid
              paginated={paginated}
              filters={filters}
              domains={availableDomains}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
