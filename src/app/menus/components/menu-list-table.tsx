"use client"

import { format } from "date-fns"
import { CornerDownRightIcon, PlusIcon } from "lucide-react"

import { DataTableServer } from "@/components/data-table/data-table-server"
import type {
  DataTableColumn,
  DataTableFilters,
} from "@/components/data-table/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Paginated } from "@/types/pagination"

import type { MenuListRow } from "../types"
import {
  MENUS_DEFAULT_DIRECTION,
  MENUS_DEFAULT_SORT,
  MENUS_PAGE_SIZE,
} from "../utils"

import { MenuRowActions } from "./menu-row-actions"

/**
 * Definisi kolom WAJIB di Client Component: `cell` dan `rowKey` adalah fungsi,
 * dan fungsi tidak bisa dioper dari Server Component ke Client Component.
 */
function buildColumns({
  from,
  onView,
  onEdit,
}: {
  from: number | null
  onView: (menu: MenuListRow) => void
  onEdit: (menu: MenuListRow) => void
}): DataTableColumn<MenuListRow>[] {
  return [
    {
      key: "no",
      header: "No.",
      cell: (_row, index) => (
        <span className="tabular-nums text-muted-foreground">
          {(from ?? 1) + index}
        </span>
      ),
    },
    {
      key: "name",
      header: "Name",
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          {row.level > 0 && (
            <span
              className="inline-flex shrink-0 text-muted-foreground"
              // Indentasi mengikuti level supaya hierarki terlihat walau list
              // diurutkan datar (bukan pohon).
              style={{ marginLeft: `${(row.level - 1) * 12}px` }}
            >
              <CornerDownRightIcon className="size-3.5" />
            </span>
          )}
          <button
            type="button"
            className="font-medium hover:underline"
            onClick={() => onView(row)}
          >
            {row.name}
          </button>
        </div>
      ),
      sortable: true,
    },
    {
      key: "slug",
      header: "Slug",
      cell: (row) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.slug}
        </span>
      ),
      sortable: true,
    },
    {
      key: "parent",
      header: "Parent",
      cell: (row) =>
        row.parentName ?? <span className="text-muted-foreground">—</span>,
    },
    {
      key: "routeName",
      header: "Route",
      cell: (row) =>
        row.routeName ? (
          <span className="font-mono text-xs text-muted-foreground">
            {row.routeName}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "layout",
      header: "Layout",
      cell: (row) => <Badge variant="outline">{row.layout}</Badge>,
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <Badge variant={row.isActive ? "default" : "secondary"}>
          {row.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "sort_order",
      header: "Order",
      cell: (row) => (
        <span className="tabular-nums text-muted-foreground">
          {row.sortOrder}
        </span>
      ),
      sortable: true,
      align: "right",
    },
    {
      key: "created_at",
      header: "Created",
      cell: (row) => (
        <span className="tabular-nums text-muted-foreground">
          {format(row.createdAt, "dd MMM yyyy")}
        </span>
      ),
      sortable: true,
      align: "right",
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      cell: (row) => (
        <MenuRowActions menu={row} onView={onView} onEdit={onEdit} />
      ),
      align: "right",
      headClassName: "w-12",
    },
  ]
}

export function MenuListTable({
  paginated,
  filters,
  layouts,
  onCreate,
  onView,
  onEdit,
}: {
  paginated: Paginated<MenuListRow>
  filters: DataTableFilters
  layouts: string[]
  onCreate: () => void
  onView: (menu: MenuListRow) => void
  onEdit: (menu: MenuListRow) => void
}) {
  return (
    <DataTableServer
      columns={buildColumns({ from: paginated.from, onView, onEdit })}
      paginated={paginated}
      filters={filters}
      url="/menus"
      rowKey={(row) => row.id}
      defaults={{
        sort: MENUS_DEFAULT_SORT,
        direction: MENUS_DEFAULT_DIRECTION,
        perPage: MENUS_PAGE_SIZE,
      }}
      toolbar={{
        searches: [{ key: "search", placeholder: "Search by name..." }],
        facets: [
          {
            key: "layout",
            title: "Layout",
            options: layouts.map((layout) => ({
              label: layout,
              value: layout,
            })),
          },
          {
            key: "status",
            title: "Status",
            options: [
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
              { label: "No parent", value: "root" },
            ],
          },
        ],
      }}
      actions={
        <Button type="button" onClick={onCreate}>
          <PlusIcon data-icon="inline-start" />
          Add New
        </Button>
      }
      emptyTitle="No menus found."
      emptyDescription="Add the first menu through the Add New button."
      emptyFilteredTitle="No menus found matching this filter."
      emptyFilteredDescription="Change the search term or clear the filter."
    />
  )
}
