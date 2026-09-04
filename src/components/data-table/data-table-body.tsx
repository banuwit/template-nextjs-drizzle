import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

import { DataTableEmpty } from "./data-table-empty"
import { DataTableHeader, textAlignClass } from "./data-table-header"
import { DataTableHeaderDropdown } from "./data-table-header-dropdown"
import { DataTableHeaderSort } from "./data-table-header-sort"
import type { SortDirection } from "./data-table-header-sort"
import { DataTableLoading } from "./data-table-loading"
import type { DataTableColumn } from "./types"

export interface DataTableBodyProps<TData> {
  columns: DataTableColumn<TData>[]
  rows: TData[]
  /** Stable React key per row. Defaults to the row index. */
  rowKey?: (row: TData, index: number) => React.Key
  sort?: string
  direction?: SortDirection
  onSort: (columnKey: string, direction: SortDirection) => void
  /**
   * Default header style for sortable columns that don't set their own
   * `headerVariant`. Default: `'sort'`.
   */
  headerVariant?: "sort" | "dropdown"
  /** Renders a loading placeholder instead of rows while a request is in flight. */
  isPending?: boolean
  emptyTitle?: string
  emptyDescription?: string
}

/**
 * Renders the shadcn `<Table>` for a column config: header, rows, empty state,
 * and the loading skeleton. Shared by `DataTableClient` and `DataTableServer`
 * so the markup lives in exactly one place.
 */
export function DataTableBody<TData>({
  columns,
  rows,
  rowKey,
  sort,
  direction,
  onSort,
  headerVariant,
  isPending = false,
  emptyTitle,
  emptyDescription,
}: DataTableBodyProps<TData>) {
  return (
    <div className="overflow-hidden rounded-md border">
      <Table className="[&_td]:px-4 [&_th]:px-4">
        <TableHeader className="bg-muted">
          <TableRow>
            {columns.map((column) => {
              if (!column.sortable) {
                return (
                  <DataTableHeader
                    key={column.key}
                    align={column.align}
                    className={column.headClassName}
                  >
                    {column.header}
                  </DataTableHeader>
                )
              }

              const HeaderComponent =
                (column.headerVariant ?? headerVariant) === "dropdown"
                  ? DataTableHeaderDropdown
                  : DataTableHeaderSort

              return (
                <HeaderComponent
                  key={column.key}
                  columnKey={column.key}
                  sort={sort}
                  direction={direction}
                  onSort={onSort}
                  align={column.align}
                  className={column.headClassName}
                >
                  {column.header}
                </HeaderComponent>
              )
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="p-0">
                <DataTableLoading />
              </TableCell>
            </TableRow>
          ) : rows.length > 0 ? (
            rows.map((row, index) => (
              <TableRow key={rowKey ? rowKey(row, index) : index}>
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={cn(
                      textAlignClass[column.align ?? "left"],
                      column.cellClassName,
                    )}
                  >
                    {column.cell(row, index)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="p-0">
                <DataTableEmpty
                  title={emptyTitle}
                  description={emptyDescription}
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
