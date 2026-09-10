"use client"

import { createColumnHelper, sortFn_datetime } from "@tanstack/react-table"
import type { ColumnDef, FilterFn } from "@tanstack/react-table"
import { format } from "date-fns"
import { PlusIcon } from "lucide-react"

import { DataGridClient } from "@/components/data-grid/data-grid-client"
import type { DataGridFeatures } from "@/components/data-grid/data-grid-features"
import { DataGridHeader } from "@/components/data-grid/data-grid-header"
import { DataGridHeaderSort } from "@/components/data-grid/data-grid-header-sort"
import type { ToolbarConfig } from "@/components/data-grid/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Parameter } from "@/db/schema"

import { ParameterRowActions } from "./parameter-row-actions"
import { ParameterValueBadge } from "./parameter-value-badge"

/**
 * Satu kotak pencarian mencakup grup/kode/nilai/deskripsi sekaligus — persis
 * UX versi `DataTableServer` sebelumnya. `DataGridClient` memetakan kotak
 * pencarian ke SATU kolom (`table.getColumn(key)?.setFilterValue(...)`), jadi
 * filter gabungan ini ditempel ke kolom "Kode": `filterFn`-nya mengabaikan
 * `getValue()` dan membaca `row.original` langsung, sedangkan accessor kolom
 * tetap `code` supaya sortir kolomnya tidak ikut berubah.
 */
const matchesSearch: FilterFn<DataGridFeatures, Parameter> = (
  row,
  _columnId,
  filterValue: string,
) => {
  if (!filterValue) {
    return true
  }

  const parameter = row.original
  const haystack = [
    parameter.group,
    parameter.code,
    parameter.value,
    parameter.description,
  ]
    .filter((part): part is string => Boolean(part))
    .join(" ")
    .toLowerCase()

  return haystack.includes(filterValue.toLowerCase())
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
    columnHelper.accessor("group", {
      header: ({ column }) => <DataGridHeaderSort column={column} title="Grup" />,
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.group}
        </span>
      ),
      // Target facet "Grup": nilai kolomnya sendiri, jadi cukup filter bawaan.
      filterFn: "multiValue",
    }),
    columnHelper.accessor("code", {
      header: ({ column }) => <DataGridHeaderSort column={column} title="Kode" />,
      cell: ({ row }) => (
        <button
          type="button"
          className="font-medium hover:underline"
          onClick={() => onView(row.original)}
        >
          {row.original.code}
        </button>
      ),
      filterFn: matchesSearch,
    }),
    columnHelper.accessor("value", {
      header: ({ column }) => <DataGridHeaderSort column={column} title="Nilai" />,
      cell: ({ row }) => <ParameterValueBadge parameter={row.original} />,
    }),
    columnHelper.display({
      id: "status",
      header: () => <DataGridHeader title="Status" />,
      enableSorting: false,
      filterFn: matchesStatusFacet,
      cell: ({ row }) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={row.original.isActive ? "default" : "secondary"}>
            {row.original.isActive ? "Aktif" : "Nonaktif"}
          </Badge>
          {row.original.isSystem && <Badge variant="outline">Sistem</Badge>}
        </div>
      ),
    }),
    columnHelper.accessor("sortOrder", {
      id: "sort_order",
      header: ({ column }) => (
        <DataGridHeaderSort column={column} title="Urutan" className="justify-end" />
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
        <DataGridHeaderSort column={column} title="Dibuat" className="justify-end" />
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
  onCreate,
  onView,
  onEdit,
}: {
  parameters: Parameter[]
  groups: string[]
  onCreate: () => void
  onView: (parameter: Parameter) => void
  onEdit: (parameter: Parameter) => void
}) {
  const toolbar: ToolbarConfig = {
    searches: [{ key: "code", placeholder: "Cari kode, nilai, grup..." }],
    facets: [
      {
        key: "group",
        title: "Grup",
        options: groups.map((group) => ({ label: group, value: group })),
      },
      {
        key: "status",
        title: "Status",
        options: [
          { label: "Aktif", value: "active" },
          { label: "Nonaktif", value: "inactive" },
          { label: "Sistem", value: "system" },
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
      actions={
        <Button type="button" onClick={onCreate}>
          <PlusIcon data-icon="inline-start" />
          Parameter baru
        </Button>
      }
      emptyTitle="Belum ada parameter."
      emptyDescription="Tambahkan parameter pertama lewat tombol Parameter baru."
      emptyFilteredTitle="Tidak ada parameter yang cocok dengan filter ini."
      emptyFilteredDescription="Ubah kata kunci atau bersihkan filter."
    />
  )
}
