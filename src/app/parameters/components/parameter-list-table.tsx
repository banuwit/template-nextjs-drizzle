"use client"

import { createColumnHelper, sortFn_datetime } from "@tanstack/react-table"
import type { ColumnDef, FilterFn } from "@tanstack/react-table"
import { format } from "date-fns"

import { DataGridClient } from "@/components/data-grid/data-grid-client"
import type { DataGridFeatures } from "@/components/data-grid/data-grid-features"
import { DataGridHeader } from "@/components/data-grid/data-grid-header"
import { DataGridHeaderSort } from "@/components/data-grid/data-grid-header-sort"
import type { ToolbarConfig } from "@/components/data-grid/types"
import { Badge } from "@/components/ui/badge"
import type { Parameter } from "@/db/schema"

import { ParameterRowActions } from "./parameter-row-actions"
import { ParameterValueBadge } from "./parameter-value-badge"

/**
 * Kotak pencarian hanya menyaring kolom "Nilai". `DataGridClient` memetakan
 * kotak pencarian ke SATU kolom (`table.getColumn(key)?.setFilterValue(...)`),
 * jadi `filterFn` ini ditempel langsung ke kolom `value`.
 */
const matchesSearch: FilterFn<DataGridFeatures, Parameter> = (
  row,
  _columnId,
  filterValue: string,
) => {
  if (!filterValue) {
    return true
  }

  const value = row.original.value

  return Boolean(value?.toLowerCase().includes(filterValue.toLowerCase()))
}
matchesSearch.autoRemove = (value) => !value

/**
 * Facet "Status" tetap satu dropdown dengan tiga opsi yang di-OR — sama
 * seperti query server sebelumnya (`active` + `system` berarti "aktif ATAU
 * sistem", bukan irisan). Kolom ini tidak punya accessor sungguhan (nilainya
 * gabungan dua boolean), jadi `filterFn` juga membaca `row.original`.
 */
const matchesStatusFacet: FilterFn<DataGridFeatures, Parameter> = (
  row,
  _columnId,
  filterValue: string[],
) => {
  if (!filterValue?.length) {
    return true
  }

  const parameter = row.original

  return filterValue.some((entry) => {
    if (entry === "active") return parameter.isActive
    if (entry === "inactive") return !parameter.isActive
    if (entry === "system") return parameter.isSystem

    return false
  })
}
matchesStatusFacet.autoRemove = (value) =>
  !Array.isArray(value) || value.length === 0

const columnHelper = createColumnHelper<DataGridFeatures, Parameter>()

/**
 * Definisi kolom WAJIB di Client Component: `cell` dan `onView`/`onEdit`
 * adalah closure, dan fungsi tidak bisa dioper dari Server Component ke
 * Client Component. `page.tsx` cukup mengirim data yang serializable.
 */
function buildColumns({
  onView,
  onEdit,
}: {
  onView: (parameter: Parameter) => void
  onEdit: (parameter: Parameter) => void
}): ColumnDef<DataGridFeatures, Parameter>[] {
  return columnHelper.columns([
    columnHelper.display({
      id: "no",
      header: () => <DataGridHeader title="No." />,
      enableHiding: false,
      cell: ({ row, table }) => {
        const { pageIndex, pageSize } = table.store.state.pagination

        return (
          <span className="text-muted-foreground tabular-nums">
            {pageIndex * pageSize + row.getDisplayIndex() + 1}
          </span>
        )
      },
    }),
    columnHelper.accessor("group", {
      header: ({ column }) => <DataGridHeaderSort column={column} title="Group" />,
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.group}
        </span>
      ),
      // Target facet "Grup": nilai kolomnya sendiri, jadi cukup filter bawaan.
      filterFn: "multiValue",
    }),
    columnHelper.accessor("code", {
      header: ({ column }) => <DataGridHeaderSort column={column} title="Code" />,
      cell: ({ row }) => (
        <button
          type="button"
          className="font-medium hover:underline"
          onClick={() => onView(row.original)}
        >
          {row.original.code}
        </button>
      ),
    }),
    columnHelper.accessor("value", {
      header: ({ column }) => <DataGridHeaderSort column={column} title="Value" />,
      cell: ({ row }) => <ParameterValueBadge parameter={row.original} />,
      filterFn: matchesSearch,
    }),
    columnHelper.display({
      id: "status",
      header: () => <DataGridHeader title="Status" />,
      enableSorting: false,
      filterFn: matchesStatusFacet,
      cell: ({ row }) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={row.original.isActive ? "default" : "secondary"}>
            {row.original.isActive ? "Active" : "Inactive"}
          </Badge>
          {row.original.isSystem && <Badge variant="outline">System</Badge>}
        </div>
      ),
    }),
    columnHelper.accessor("sortOrder", {
      id: "sort_order",
      header: ({ column }) => (
        <DataGridHeaderSort column={column} title="Order" className="justify-end" />
      ),
      cell: ({ row }) => (
        <span className="block text-right tabular-nums text-muted-foreground">
          {row.original.sortOrder}
        </span>
      ),
    }),
    columnHelper.accessor("createdAt", {
      id: "created_at",
      header: ({ column }) => (
        <DataGridHeaderSort column={column} title="Created" className="justify-end" />
      ),
      // "auto" mendeteksi kolom bertipe Date sebagai `datetime`, tapi cuma
      // `alphanumeric`/`text` yang didaftarkan di `data-grid-features.ts` —
      // dipasang eksplisit di sini supaya tidak jatuh ke warning + fallback.
      sortFn: sortFn_datetime,
      cell: ({ row }) => (
        <span className="block text-right tabular-nums text-muted-foreground">
          {format(row.original.createdAt, "dd MMM yyyy")}
        </span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: () => <div className="text-right" />,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <ParameterRowActions
            parameter={row.original}
            onView={onView}
            onEdit={onEdit}
          />
        </div>
      ),
    }),
  ])
}

export function ParameterListTable({
  parameters,
  groups,
  onView,
  onEdit,
}: {
  parameters: Parameter[]
  groups: string[]
  onView: (parameter: Parameter) => void
  onEdit: (parameter: Parameter) => void
}) {
  const toolbar: ToolbarConfig = {
    searches: [{ key: "value", placeholder: "Search by value..." }],
    facets: [
      {
        key: "group",
        title: "Group",
        options: groups.map((group) => ({ label: group, value: group })),
      },
      {
        key: "status",
        title: "Status",
        options: [
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
          { label: "System", value: "system" },
        ],
      },
    ],
  }

  return (
    <DataGridClient
      columns={buildColumns({ onView, onEdit })}
      data={parameters}
      getRowId={(row) => String(row.id)}
      defaultSorting={[{ id: "sort_order", desc: false }]}
      toolbar={toolbar}
      emptyTitle="No parameters found."
      emptyDescription="Add the first parameter through the Add New button."
      emptyFilteredTitle="No parameters found matching this filter."
      emptyFilteredDescription="Change the search term or clear the filter."
    />
  )
}
