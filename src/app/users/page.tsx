import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { PlusIcon } from "lucide-react"

import Heading from "@/components/heading"
import { AppLayout } from "@/components/layouts/app-layout"
import type { DataGridFilters } from "@/components/data-grid/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import { UserGrid } from "./components/user-grid"
import { listUsers } from "./queries"
import { buildUsersHref, parseUserListParams } from "./utils"

export const metadata: Metadata = {
  title: "Users",
}

// Halaman ini query DB: tanpa ini `next build` akan memprerender dan membekukan hasilnya.
export const dynamic = "force-dynamic"

export default async function UsersPage({ searchParams }: PageProps<"/users">) {
  const listParams = parseUserListParams(await searchParams)
  const paginated = await listUsers(listParams)

  if (listParams.page > paginated.last_page) {
    redirect(buildUsersHref({ ...listParams, page: paginated.last_page }))
  }

  // `DataGridServer` menampilkan panah sort dari `filters.sort` /
  // `filters.direction` apa adanya — kalau dioper raw searchParams, kunjungan
  // pertama tanpa `?sort=` di URL tidak menunjukkan panah pada kolom "Dibuat"
  // meski datanya memang sudah terurut begitu. Jadi yang dioper ke sini
  // adalah filter yang **sudah di-resolve** (whitelist + default terisi),
  // sama seperti kontrak "resolved filters" yang didokumentasikan di
  // `DataGridServerProps.filters`.
  const filters: DataGridFilters = {
    search: listParams.search,
    sort: listParams.sort,
    direction: listParams.direction,
    per_page: String(listParams.perPage),
  }

  return (
    <AppLayout breadcrumbs={[{ label: "Users" }]}>
      <div className="flex h-full min-w-0 flex-1 flex-col gap-6 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <Heading title="Users" />
          <Button nativeButton={false} render={<Link href="/users/new" />}>
            <PlusIcon data-icon="inline-start" />
            Add New
          </Button>
        </div>

        <Card className="gap-0 overflow-hidden py-0">
          <CardContent className="flex flex-col gap-4 p-4">
            <UserGrid paginated={paginated} filters={filters} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
