"use client"

import { useTable } from "@tanstack/react-table"
import type {
  ColumnDef,
  ColumnFiltersState,
  ColumnOrderState,
  ColumnPinningState,
  ColumnVisibilityState,
  PaginationState,
  RowData,
  SortingState,
} from "@tanstack/react-table"
import * as React from "react"

import { FacetedFilter } from "@/components/filters/faceted-filter"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { PAGE_SIZE } from "./constants"
import { DataGridEmpty } from "./data-grid-empty"
import { features } from "./data-grid-features"
import type { DataGridFeatures } from "./data-grid-features"
import { DataGridPaginationAdvance } from "./data-grid-pagination-advance"
import { DataGridPaginationSimple } from "./data-grid-pagination-simple"
import { getPinnedCellProps, useColumnPinOffsets } from "./data-grid-pinning"
import { DataGridSearchInput } from "./data-grid-search-input"
import { DataGridVisibilityToggle } from "./data-grid-visibility-toggle"
import type { ToolbarConfig } from "./types"

export interface DataGridClientProps<TData extends RowData> {
  columns: ColumnDef<DataGridFeatures, TData>[]
  data: TData[]
  /** Omit for a plain grid with sorting only — no search or filter. */
  toolbar?: ToolbarConfig
  defaultSorting?: SortingState
  /** Extra buttons rendered to the right of the visibility toggle. */
  actions?: React.ReactNode
  /** Hide the toolbar's column visibility toggle. Default: true. */
  showVisibilityToggle?: boolean
  /**
   * Show the "View columns" submenu inside every `DataGridHeaderDropdown`.
   * Default: true. A column can still override it per header.
   */
  showHeaderVisibilityToggle?: boolean
  /**
   * Add "Pin to left" / "Pin to right" to the header dropdown and make
   * pinned columns sticky while the grid scrolls sideways. Default: false.
   */
  enableColumnPinning?: boolean
  /**
   * Add "Move to left" / "Move to right" to the header dropdown.
   * Default: false.
   */
  enableColumnOrdering?: boolean
  /**
   * Columns pinned on first render, e.g. `{ start: [], end: ['actions'] }`.
   * Use this for label-only headers, which have no dropdown to pin from.
   */
  defaultColumnPinning?: ColumnPinningState
  /** Column ids in their initial order. Defaults to the column def order. */
  defaultColumnOrder?: ColumnOrderState
  /**
   * Stable row id, e.g. `(row) => String(row.id)`. Without this, TanStack
   * falls back to the row's index as its id — after a delete, sort, or
   * filter change, a row's index gets reused by a *different* record, and
   * any row-local React state (an open menu, a confirmation dialog) leaks
   * onto it instead of resetting. Always pass this when rows have a stable id.
   */
  getRowId?: (row: TData, index: number) => string
  emptyTitle?: string
  emptyDescription?: string
  emptyFilteredTitle?: string
  emptyFilteredDescription?: string
  /** Pagination style, or `none` to render every row. Default: `advance`. */
  pagination?: "advance" | "simple" | "none"
}

export function DataGridClient<TData extends RowData>({
  columns,
  data,
  toolbar,
  defaultSorting = [],
  actions,
  showVisibilityToggle = true,
  showHeaderVisibilityToggle = true,
  enableColumnPinning = false,
  enableColumnOrdering = false,
  defaultColumnPinning,
  defaultColumnOrder,
  getRowId,
  emptyTitle,
  emptyDescription,
  emptyFilteredTitle,
  emptyFilteredDescription,
  pagination = "advance",
}: DataGridClientProps<TData>) {
  const facets = toolbar?.facets ?? []
  const searchConfigs = toolbar?.searches ?? []
  const paginate = pagination !== "none"

  const [sorting, setSorting] = React.useState<SortingState>(defaultSorting)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>({})
  const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>(
    () => defaultColumnPinning ?? { start: [], end: [] },
  )
  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>(
    () => defaultColumnOrder ?? [],
  )
  const [paginationState, setPaginationState] = React.useState<PaginationState>(
    {
      pageIndex: 0,
      pageSize: PAGE_SIZE,
    },
  )

  const table = useTable({
    features,
    data,
    columns,
    getRowId,
    enableSortingRemoval: false,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    onColumnOrderChange: setColumnOrder,
    onPaginationChange: setPaginationState,
    enableColumnPinning,
    meta: {
      enableColumnPinning,
      enableColumnOrdering,
      showHeaderVisibilityToggle,
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      columnPinning,
      columnOrder,
      pagination: paginationState,
    },
  })

  const { registerHeader, offsets } = useColumnPinOffsets(
    table.getPinnedVisibleLeafColumns("start").map((column) => column.id),
    table.getPinnedVisibleLeafColumns("end").map((column) => column.id),
  )

  const resetPage = () => {
    setPaginationState((current) => ({ ...current, pageIndex: 0 }))
  }

  const handleSearch = (key: string, value: string) => {
    table.getColumn(key)?.setFilterValue(value || undefined)
    resetPage()
  }

  const getSearchValue = (key: string) =>
    (columnFilters.find((filter) => filter.id === key)?.value as string) ?? ""

  const getFacetValues = (key: string) => {
    const applied = columnFilters.find((filter) => filter.id === key)?.value

    return Array.isArray(applied) ? (applied as string[]) : []
  }

  const applyFacet = (key: string, values: string[]) => {
    table.getColumn(key)?.setFilterValue(values.length ? values : undefined)
    resetPage()
  }

  // `getRowModel()` returns the paginated slice; when pagination is off,
  // read the pre-pagination (filtered + sorted) rows instead so every row
  // renders.
  const rows = paginate
    ? table.getRowModel().rows
    : table.getSortedRowModel().rows

  return (
    <div className="flex flex-col gap-3">
      {toolbar && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {searchConfigs.map((search) => (
              <DataGridSearchInput
                key={search.key}
                placeholder={search.placeholder}
                value={getSearchValue(search.key)}
                onChange={(value) => handleSearch(search.key, value)}
              />
            ))}
            {facets.map((facet) => (
              <FacetedFilter
                key={facet.key}
                title={facet.title}
                options={facet.options}
                variant={facet.variant}
                appliedValues={getFacetValues(facet.key)}
                onApply={(values) => applyFacet(facet.key, values)}
                onClear={() => applyFacet(facet.key, [])}
              />
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {showVisibilityToggle && (
              <DataGridVisibilityToggle
                table={table}
                columnVisibility={columnVisibility}
              />
            )}
            {actions}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    ref={registerHeader(header.column.id)}
                    aria-sort={
                      header.column.getIsSorted() === "asc"
                        ? "ascending"
                        : header.column.getIsSorted() === "desc"
                          ? "descending"
                          : "none"
                    }
                    {...getPinnedCellProps(
                      header.column.getIsPinned(),
                      offsets,
                      header.column.id,
                      { isHeader: true },
                    )}
                  >
                    {header.isPlaceholder ? null : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="group/row"
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      {...getPinnedCellProps(
                        cell.column.getIsPinned(),
                        offsets,
                        cell.column.id,
                      )}
                    >
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className="p-0"
                >
                  <DataGridEmpty
                    title={data.length === 0 ? emptyTitle : emptyFilteredTitle}
                    description={
                      data.length === 0
                        ? emptyDescription
                        : emptyFilteredDescription
                    }
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {paginate && pagination === "advance" && (
        <DataGridPaginationAdvance table={table} pagination={paginationState} />
      )}
      {paginate && pagination === "simple" && (
        <DataGridPaginationSimple table={table} pagination={paginationState} />
      )}
    </div>
  )
}
