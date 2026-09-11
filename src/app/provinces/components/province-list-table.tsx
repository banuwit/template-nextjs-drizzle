"use client"

import { format } from "date-fns"

import { DataTableClient } from "@/components/data-table/data-table-client"
import type { DataTableColumn } from "@/components/data-table/types"
import type { Province } from "@/db/schema"

import { ProvinceRowActions } from "./province-row-actions"

/**
 * Definisi kolom WAJIB di Client Component: `cell` adalah fungsi, dan fungsi
 * tidak bisa dioper dari Server Component ke Client Component. `page.tsx`
 * cukup mengirim data yang serializable.
 *
 * `key` di sini harus sama persis dengan nama properti `Province` — mode
 * client membaca `row[key]` langsung untuk sort/filter (beda dengan mode
 * server yang memetakan `key` ke nama kolom SQL).
 */
function buildColumns({
  onView,
  onEdit,
}: {
  onView: (province: Province) => void
  onEdit: (province: Province) => void
}): DataTableColumn<Province>[] {
  return [
    {
      key: "no",
      header: "No.",
      searchable: false,
      // Tanpa footer pagination, seluruh baris ada di satu "halaman" —
      // `index` di sini sudah nomor urut final, tidak perlu ditambah offset.
      cell: (_row, index) => (
        <span className="tabular-nums text-muted-foreground">
          {index + 1}
        </span>
      ),
      headClassName: "w-12",
    },
    {
      key: "name",
      header: "Name",
      sortable: true,
      cell: (row) => (
        <button
          type="button"
          className="font-medium hover:underline"
          onClick={() => onView(row)}
        >
          {row.name}
        </button>
      ),
    },
    {
      key: "code",
      header: "Code",
      sortable: true,
      searchable: false,
      cell: (row) => (
        <span className="tabular-nums text-muted-foreground">
          {row.code}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      align: "right",
      // Tanpa ini, pencarian gabungan ikut mencocokkan `String(Date)` — yang
      // di beberapa runtime menyisipkan nama zona waktu (mis. "Western
      // Indonesia Time") dan bisa salah cocok ke istilah yang tidak terkait.
      searchable: false,
      cell: (row) => (
        <span className="tabular-nums text-muted-foreground">
          {format(row.createdAt, "dd MMM yyyy")}
        </span>
      ),
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      align: "right",
      headClassName: "w-28",
      cell: (row) => (
        <ProvinceRowActions province={row} onView={onView} onEdit={onEdit} />
      ),
    },
  ]
}

export function ProvinceListTable({
  provinces,
  onView,
  onEdit,
}: {
  provinces: Province[]
  onView: (province: Province) => void
  onEdit: (province: Province) => void
}) {
  return (
    <DataTableClient
      columns={buildColumns({ onView, onEdit })}
      data={provinces}
      rowKey={(row) => row.id}
      pagination="none"
      defaultSort={{ key: "createdAt", direction: "desc" }}
      toolbar={{
        searches: [{ key: "search", placeholder: "Search by name..." }],
      }}
      emptyTitle="No provinces found."
      emptyDescription="Add the first province through the Add New button."
      emptyFilteredTitle="No provinces found matching this search."
      emptyFilteredDescription="Change the search term or clear the filter."
    />
  )
}
