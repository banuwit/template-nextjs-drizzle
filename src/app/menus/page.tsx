import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { AppLayout } from "@/components/layouts/app-layout"

import { MenuWorkspace } from "./components/menu-workspace"
import {
  listMenuLayouts,
  listMenuParentOptions,
  listMenus,
  nextMenuSortOrder,
} from "./queries"
import { buildMenusHref, parseMenuListParams } from "./utils"

export const metadata: Metadata = {
  title: "Menus",
}

// Halaman ini query DB: tanpa ini `next build` akan memprerender dan membekukan hasilnya.
export const dynamic = "force-dynamic"

export default async function MenusPage({
  searchParams,
}: PageProps<"/menus">) {
  const raw = await searchParams
  const params = parseMenuListParams(raw)

  const [paginated, layouts, parentOptions, suggestedSortOrder] =
    await Promise.all([
      listMenus(params),
      listMenuLayouts(),
      listMenuParentOptions(),
      nextMenuSortOrder(),
    ])

  if (params.page > paginated.last_page) {
    redirect(buildMenusHref({ ...params, page: paginated.last_page }))
  }

  return (
    <AppLayout breadcrumbs={[{ label: "Menus" }]}>
      <div className="flex h-full flex-1 flex-col gap-6 p-4">
        <MenuWorkspace
          paginated={paginated}
          // `sort` / `direction` dikirim dalam bentuk yang sudah di-resolve,
          // bukan mentah: kalau param-nya absen (karena sama dengan default),
          // panah sort di header akan menunjuk arah yang salah.
          filters={{ ...raw, sort: params.sort, direction: params.direction }}
          layouts={layouts}
          parentOptions={parentOptions}
          nextSortOrder={suggestedSortOrder}
        />
      </div>
    </AppLayout>
  )
}
