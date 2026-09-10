"use client"

import { format } from "date-fns"

import { DataTableClient } from "@/components/data-table/data-table-client"
import type { DataTableColumn } from "@/components/data-table/types"
import type { Country } from "@/db/schema"

import { CountryRowActions } from "./country-row-actions"

/**
 * Definisi kolom WAJIB di Client Component: `cell` adalah fungsi, dan fungsi
 * tidak bisa dioper dari Server Component ke Client Component. `page.tsx`
 * cukup mengirim data yang serializable.
 *
 * `key` di sini harus sama persis dengan nama properti `Country` — mode
 * client membaca `row[key]` langsung untuk sort/filter (beda dengan mode
 * server yang memetakan `key` ke nama kolom SQL).
 */
function buildColumns({
  onView,
  onEdit,
}: {
  onView: (country: Country) => void
  onEdit: (country: Country) => void
}): DataTableColumn<Country>[] {
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
      header: "Nama",
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
      header: "Kode",
      sortable: true,
      cell: (row) => (
        <span className="tabular-nums text-muted-foreground">
          {row.code}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Dibuat",
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
      header: <span className="sr-only">Aksi</span>,
      align: "right",
      headClassName: "w-28",
      cell: (row) => (
        <CountryRowActions country={row} onView={onView} onEdit={onEdit} />
      ),
    },
  ]
}

export function CountryListTable({
  countries,
  onView,
  onEdit,
}: {
  countries: Country[]
  onView: (country: Country) => void
  onEdit: (country: Country) => void
}) {
  return (
    <DataTableClient
      columns={buildColumns({ onView, onEdit })}
      data={countries}
      rowKey={(row) => row.id}
      pagination="none"
      defaultSort={{ key: "createdAt", direction: "desc" }}
      toolbar={{
        searches: [{ key: "search", placeholder: "Cari nama atau kode..." }],
      }}
      emptyTitle="Belum ada negara."
      emptyDescription="Tambahkan negara pertama lewat tombol Negara baru."
      emptyFilteredTitle="Tidak ada negara yang cocok dengan pencarian ini."
      emptyFilteredDescription="Ubah kata kunci pencarian."
    />
  )
}
