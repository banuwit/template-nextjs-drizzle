"use client"

import { DataTableServer } from "@/components/data-table/data-table-server"
import type {
  DataTableColumn,
  DataTableFilters,
} from "@/components/data-table/types"
import type { Paginated } from "@/types/pagination"
import type { User } from "@/db/schema"

import { EXAMPLE_PAGE_SIZE } from "../constants"

/**
 * Definisi kolom WAJIB berada di Client Component.
 *
 * `cell` dan `rowKey` adalah fungsi, dan React tidak mengizinkan fungsi
 * dioper dari Server Component ke Client Component ("Functions cannot be
 * passed directly to Client Components"). Jadi page.tsx cukup mengoper data
 * yang serializable, dan komponen inilah yang memegang kolomnya.
 */
const columns: DataTableColumn<User>[] = [
  {
    key: "name",
    header: "Nama",
    cell: (row) => <span className="font-medium">{row.name}</span>,
    sortable: true,
  },
  {
    key: "email",
    header: "Email",
    cell: (row) => row.email,
    sortable: true,
    headerVariant: "dropdown",
  },
  {
    key: "created_at",
    header: "Dibuat",
    cell: (row) => row.createdAt.toLocaleDateString("id-ID"),
    sortable: true,
    align: "right",
  },
]

export interface ExampleUserTableProps {
  paginated: Paginated<User>
  filters: DataTableFilters
  domains: string[]
}

export function ExampleUserTable({
  paginated,
  filters,
  domains,
}: ExampleUserTableProps) {
  return (
    <DataTableServer
      columns={columns}
      paginated={paginated}
      filters={filters}
      url="/examples/data-table"
      rowKey={(row) => row.id}
      defaults={{
        sort: "created_at",
        direction: "desc",
        perPage: EXAMPLE_PAGE_SIZE,
      }}
      toolbar={{
        searches: [{ key: "search", placeholder: "Cari nama atau email..." }],
        facets: [
          {
            key: "domain",
            title: "Domain",
            options: domains.map((domain) => ({
              label: domain,
              value: domain,
            })),
          },
        ],
      }}
      emptyTitle="Belum ada user."
      emptyFilteredTitle="Tidak ada user yang cocok dengan filter ini."
    />
  )
}
