"use client"

import { DataGridServer } from "@/components/data-grid/data-grid-server"
import type { DataGridFilters } from "@/components/data-grid/types"
import type { User } from "@/db/schema"
import type { Paginated } from "@/types/pagination"

// Kolom lokal milik fitur users — persis pola yang dimaksud: definisi kolom
// hidup di Client Component, grid-nya generik.
import { userColumns } from "@/app/users/components/user-columns"

import { EXAMPLE_PAGE_SIZE } from "../constants"

export interface ExampleUserGridProps {
  paginated: Paginated<User>
  filters: DataGridFilters
  domains: string[]
}

export function ExampleUserGrid({
  paginated,
  filters,
  domains,
}: ExampleUserGridProps) {
  return (
    <DataGridServer
      columns={userColumns}
      paginated={paginated}
      filters={filters}
      url="/examples/data-grid"
      getRowId={(row) => String(row.id)}
      enableColumnPinning
      enableColumnOrdering
      defaultColumnPinning={{ start: ["no"], end: ["actions"] }}
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
