import type {
  ColumnVisibilityState,
  ReactTable,
  RowData,
} from "@tanstack/react-table"
import { Columns3 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type { DataGridFeatures } from "./data-grid-features"
import { formatColumnId } from "./utils"

interface DataGridVisibilityToggleProps<TData extends RowData> {
  table: ReactTable<DataGridFeatures, TData>
  columnVisibility?: ColumnVisibilityState
}

export function DataGridVisibilityToggle<TData extends RowData>({
  table,
  columnVisibility = {},
}: DataGridVisibilityToggleProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="ml-auto hidden text-muted-foreground lg:flex"
          />
        }
      >
        <Columns3 />
        View
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" && column.getCanHide(),
          )
          .map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={columnVisibility[column.id] !== false}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {formatColumnId(column.id)}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
