"use client"

import { createColumnHelper } from "@tanstack/react-table"

import { type DataTableFeatures } from "./data-table-features"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableActions } from "./data-table-actions"

export type Payment = {
  id: string
  name: string
  email: string
  gender: "male" | "female"
  role: "Admin" | "Editor" | "Viewer" | "Manager" | "Analyst" | "Support"
  amount: number
  status: "pending" | "processing" | "success" | "failed"
}

const columnHelper = createColumnHelper<DataTableFeatures, Payment>()

export const columns = columnHelper.columns([
  columnHelper.display({
    id: "no",
    header: "No.",
    enableHiding: false,
    cell: ({ row }) => {
      const displayIndex = row.getDisplayIndex();

      return (
        <span className="tabular-nums text-muted-foreground">
          {displayIndex === -1 ? '' : displayIndex + 1}
        </span>
      );
    },
  }),
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  }),
  columnHelper.accessor("gender", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Gender" />
    ),
    cell: ({ row }) => (
      <span className="capitalize">{row.getValue("gender")}</span>
    ),
  }),
  columnHelper.accessor("role", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
  }),
  columnHelper.accessor("email", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  }),
  columnHelper.accessor("status", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
  }),
  columnHelper.accessor("amount", {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Amount"
        className="justify-end"
      />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)

      return <div className="text-right font-medium">{formatted}</div>
    },
  }),
  columnHelper.display({
    id: "actions",
    cell: ({ row }) => <DataTableActions payment={row.original} />,
  }),
])
