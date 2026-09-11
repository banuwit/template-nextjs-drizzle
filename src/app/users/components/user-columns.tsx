"use client"

import Link from "next/link"
import { createColumnHelper } from "@tanstack/react-table"
import { format } from "date-fns"

import type { DataGridFeatures } from "@/components/data-grid/data-grid-features"
import { DataGridHeader } from "@/components/data-grid/data-grid-header"
import { DataGridHeaderDropdown } from "@/components/data-grid/data-grid-header-dropdown"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { User } from "@/db/schema"
import { getInitials } from "@/lib/initials"

import { UserRowActions } from "./user-row-actions"

function NameCell({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar size="sm">
        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
      </Avatar>
      <span className="font-medium">
        <Link href={`/users/${user.id}`} className="hover:underline">
          {user.name}
        </Link>
      </span>
    </div>
  )
}

const columnHelper = createColumnHelper<DataGridFeatures, User>()

/**
 * Kolom list user untuk `DataGridServer`. `id` kolom sortable (`name`,
 * `email`, `created_at`) harus sama persis dengan `UserSortColumn` di
 * `../types` dan dengan key map `sortable` di `../queries.ts`.
 */
export const userColumns = columnHelper.columns([
  columnHelper.display({
    id: "no",
    header: () => <DataGridHeader title="No." />,
    enableHiding: false,
    cell: ({ row, table }) => {
      // `DataGridServer` memakai manual pagination, jadi `table` hanya berisi
      // baris halaman ini — `row.getDisplayIndex()` relatif terhadap halaman
      // tersebut, karena itu ditambah offset `pageIndex * pageSize` supaya
      // nomornya menyambung antar halaman (dan ikut menyesuaikan saat
      // `per_page` berubah).
      const { pageIndex, pageSize } = table.store.state.pagination

      return (
        <span className="text-muted-foreground tabular-nums">
          {pageIndex * pageSize + row.getDisplayIndex() + 1}
        </span>
      )
    },
  }),
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <DataGridHeaderDropdown column={column} title="Name" />
    ),
    cell: ({ row }) => <NameCell user={row.original} />,
  }),
  columnHelper.accessor("email", {
    header: ({ column }) => (
      <DataGridHeaderDropdown column={column} title="Email" />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.email}</span>
    ),
  }),
  columnHelper.accessor("createdAt", {
    id: "created_at",
    header: ({ column }) => (
      <DataGridHeaderDropdown column={column} title="Created" />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {format(row.original.createdAt, "dd MMM yyyy")}
      </span>
    ),
  }),
  columnHelper.display({
    id: "actions",
    header: () => <div className="text-right" />,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <UserRowActions
          user={{ id: row.original.id, name: row.original.name }}
        />
      </div>
    ),
  }),
])
