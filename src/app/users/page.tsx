import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { PlusIcon } from "lucide-react"

import Heading from "@/components/heading"
import { AppLayout } from "@/components/layouts/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import { UserPagination } from "./components/user-pagination"
import { UserSearchForm } from "./components/user-search-form"
import { UserTable } from "./components/user-table"
import { listUsers } from "./queries"
import { buildUsersHref, parseUserListParams } from "./utils"

export const metadata: Metadata = {
  title: "Users",
}

// Halaman ini query DB: tanpa ini `next build` akan memprerender dan membekukan hasilnya.
export const dynamic = "force-dynamic"

export default async function UsersPage({ searchParams }: PageProps<"/users">) {
  const { q, page } = parseUserListParams(await searchParams)
  const { rows, total, pageCount, offset } = await listUsers({ q, page })

  if (page > pageCount) {
    redirect(buildUsersHref({ q, page: pageCount }))
  }

  return (
    <AppLayout breadcrumbs={[{ label: "Users" }]}>
      <div className="flex h-full flex-1 flex-col gap-6 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <Heading
            variant="small"
            title="Users"
            description="Kelola user yang terdaftar di workspace ini."
          />
          <Button nativeButton={false} render={<Link href="/users/new" />}>
            <PlusIcon data-icon="inline-start" />
            User baru
          </Button>
        </div>

        <Card className="gap-0 overflow-hidden py-0">
          <CardContent className="flex flex-col gap-4 p-4">
            <UserSearchForm q={q} />
            <UserTable
              users={rows}
              offset={offset}
              emptyMessage={
                q
                  ? `Tidak ada user yang cocok dengan "${q}".`
                  : "Belum ada user."
              }
            />
            <UserPagination
              page={page}
              pageCount={pageCount}
              total={total}
              q={q}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
