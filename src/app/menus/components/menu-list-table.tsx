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
  onView,
  onEdit,
}: {
  onView: (menu: MenuListRow) => void
  onEdit: (menu: MenuListRow) => void
}): DataTableColumn<MenuListRow>[] {
  return [
    {
      key: "name",
      header: "Nama",
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
      header: "Induk",
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
          {row.isActive ? "Aktif" : "Nonaktif"}
        </Badge>
      ),
    },
    {
      key: "sort_order",
      header: "Urutan",
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
      header: "Dibuat",
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
      header: <span className="sr-only">Aksi</span>,
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
      columns={buildColumns({ onView, onEdit })}
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
        searches: [{ key: "search", placeholder: "Cari nama, slug, route..." }],
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
              { label: "Aktif", value: "active" },
              { label: "Nonaktif", value: "inactive" },
              { label: "Tanpa induk", value: "root" },
            ],
          },
        ],
      }}
      actions={
        <Button type="button" onClick={onCreate}>
          <PlusIcon data-icon="inline-start" />
          Menu baru
        </Button>
      }
      emptyTitle="Belum ada menu."
      emptyDescription="Tambahkan menu pertama lewat tombol Menu baru."
      emptyFilteredTitle="Tidak ada menu yang cocok dengan filter ini."
      emptyFilteredDescription="Ubah kata kunci atau bersihkan filter."
    />
  )
}
