import type {
  ColumnVisibilityState,
  RowData,
  Table,
} from "@tanstack/react-table"
import { Settings2 } from "lucide-react"

import {
  DropdownMenuCheckboxItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"

import type { DataGridFeatures } from "./data-grid-features"
import { formatColumnId } from "./utils"

interface DataGridVisibilityHeaderProps<TData extends RowData> {
  table: Table<DataGridFeatures, TData>
  /** Defaults to the table store's current visibility state. */
  columnVisibility?: ColumnVisibilityState
}

export function DataGridVisibilityHeader<TData extends RowData>({
  table,
  columnVisibility = table.store.state.columnVisibility,
}: DataGridVisibilityHeaderProps<TData>) {
  const columns = table
    .getAllColumns()
    .filter(
      (column) =>
        typeof column.accessorFn !== "undefined" && column.getCanHide(),
    )

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Settings2 />
        View
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent className="w-40">
          {columns.map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={columnVisibility[column.id] !== false}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {formatColumnId(column.id)}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  )
}
