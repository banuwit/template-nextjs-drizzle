"use client"

import { DataGridServer } from "@/components/data-grid/data-grid-server"
import type { DataGridFilters } from "@/components/data-grid/types"
import type { User } from "@/db/schema"
import type { Paginated } from "@/types/pagination"

import { USERS_PAGE_SIZE } from "../utils"
import { userColumns } from "./user-columns"

export function UserGrid({
  paginated,
  filters,
}: {
  paginated: Paginated<User>
  filters: DataGridFilters
}) {
  return (
    <DataGridServer
      columns={userColumns}
      paginated={paginated}
      filters={filters}
      url="/users"
      getRowId={(row) => String(row.id)}
      enableColumnPinning
      enableColumnOrdering
      defaults={{
        sort: "created_at",
        direction: "desc",
        perPage: USERS_PAGE_SIZE,
      }}
      toolbar={{
        searches: [{ key: "search", placeholder: "Search by name..." }],
      }}
      emptyTitle="No users found."
      emptyFilteredTitle="No users found matching this search."
    />
  )
}
