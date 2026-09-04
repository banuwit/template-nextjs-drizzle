"use client"

import { useTable } from "@tanstack/react-table"
import type {
  ColumnDef,
  ColumnOrderState,
  ColumnPinningState,
  ColumnVisibilityState,
  RowData,
  SortingState,
} from "@tanstack/react-table"
import * as React from "react"

import { useListNavigation, type QueryValue } from "@/hooks/use-list-navigation"

import { FacetedFilter } from "@/components/filters/faceted-filter"
import { SelectBox } from "@/components/filters/select-box"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { PAGE_SIZE, SEARCH_DEBOUNCE_MS } from "./constants"
import { DataGridEmpty } from "./data-grid-empty"
import { features } from "./data-grid-features"
import type { DataGridFeatures } from "./data-grid-features"
import { DataGridLoading } from "./data-grid-loading"
import { DataGridPaginationAdvance } from "./data-grid-pagination-advance"
import { DataGridPaginationSimple } from "./data-grid-pagination-simple"
import { getPinnedCellProps, useColumnPinOffsets } from "./data-grid-pinning"
import { DataGridSearchInput } from "./data-grid-search-input"
import { DataGridVisibilityToggle } from "./data-grid-visibility-toggle"
import type { DataGridFilters, Paginated, ToolbarConfig } from "./types"

/**
 * Query defaults the controller already applies. Params matching a default are
 * dropped from the URL so the address bar stays clean.
 */
export interface DataGridServerDefaults {
  sort?: string
  direction?: "asc" | "desc"
  perPage?: number
}

export interface DataGridServerProps<TData extends RowData> {
  columns: ColumnDef<DataGridFeatures, TData>[]
  /** The paginator straight from the controller. */
  paginated: Paginated<TData>
  /** The resolved filters the controller echoed back. */
  filters: DataGridFilters
  /** Pathname tujuan, mis. `/users`. Default: pathname saat ini. */
  url?: string
  toolbar?: ToolbarConfig
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
   * falls back to the row's index as its id — after a delete or a page/sort
   * change, a row's index gets reused by a *different* record, and any
   * row-local React state (an open menu, a confirmation dialog) leaks onto
   * it instead of resetting. Always pass this when rows have a stable id.
   */
  getRowId?: (row: TData, index: number) => string
  defaults?: DataGridServerDefaults
  /** Pagination style, or `none` to hide it (e.g. the query returns every row already). Default: `advance`. */
  pagination?: "advance" | "simple" | "none"
  /** Shown when there are no rows and no search/facet is active. */
  emptyTitle?: string
  emptyDescription?: string
  /** Shown when there are no rows while a search or facet is active. Falls back to `emptyTitle`/`emptyDescription` when omitted. */
  emptyFilteredTitle?: string
  emptyFilteredDescription?: string
}

export function DataGridServer<TData extends RowData>({
  columns,
  paginated,
  filters,
  url,
  toolbar,
  actions,
  showVisibilityToggle = true,
  showHeaderVisibilityToggle = true,
  enableColumnPinning = false,
  enableColumnOrdering = false,
  defaultColumnPinning,
  defaultColumnOrder,
  getRowId,
  defaults = {},
  pagination = "advance",
  emptyTitle,
  emptyDescription,
  emptyFilteredTitle,
  emptyFilteredDescription,
}: DataGridServerProps<TData>) {
  const facets = toolbar?.facets ?? []
  const selects = toolbar?.selects ?? []
  const searchConfigs = toolbar?.searches ?? []

  // True when a search box, facet, or select is currently narrowing the
  // result set — distinguishes "no rows in this filter" from "no rows at
  // all" in the empty state.
  const isFiltered =
    searchConfigs.some((search) => !!filters[search.key]) ||
    [...facets, ...selects].some((filter) => {
      const value = filters[filter.key]

      return Array.isArray(value) ? value.length > 0 : !!value
    })

  const { perPage: defaultPerPage = PAGE_SIZE } = defaults

  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>({})
  const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>(
    () => defaultColumnPinning ?? { start: [], end: [] },
  )
  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>(
    () => defaultColumnOrder ?? [],
  )

  // Search is debounced locally, so it needs its own state; everything else
  // is derived from the props the Server Component sent down.
  const [searches, setSearches] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(
      searchConfigs.map((search) => [
        search.key,
        (filters[search.key] as string) ?? "",
      ]),
    ),
  )

  const searchTimeouts = React.useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({})

  React.useEffect(() => {
    const timeouts = searchTimeouts.current

    return () => {
      Object.values(timeouts).forEach(clearTimeout)
    }
  }, [])

  const sorting: SortingState = filters.sort
    ? [{ id: filters.sort, desc: filters.direction !== "asc" }]
    : []

  const perPage = Number(filters.per_page ?? defaultPerPage)

  const { visit: navigate, isPending } = useListNavigation(url, {
    perPage: PAGE_SIZE,
    ...defaults,
  })

  // Setiap kunjungan mengirim ulang seluruh filter yang sedang aktif — query
  // string adalah satu-satunya sumber kebenaran, jadi param yang tidak
  // disertakan berarti dihapus.
  const visit = React.useCallback(
    (overrides: Record<string, QueryValue>) => {
      navigate({
        ...filters,
        page: paginated.current_page,
        ...overrides,
      })
    },
    [navigate, filters, paginated.current_page],
  )

  const table = useTable({
    features,
    data: paginated.data,
    columns,
    getRowId,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount: paginated.total,
    enableSortingRemoval: false,
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater
      const sort = next[0]

      visit({
        sort: sort?.id,
        direction: sort ? (sort.desc ? "desc" : "asc") : undefined,
        page: 1,
      })
    },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    onColumnOrderChange: setColumnOrder,
    enableColumnPinning,
    meta: {
      enableColumnPinning,
      enableColumnOrdering,
      showHeaderVisibilityToggle,
    },
    state: {
      sorting,
      columnVisibility,
      columnPinning,
      columnOrder,
      pagination: {
        pageIndex: paginated.current_page - 1,
        pageSize: perPage,
      },
    },
  })

  const { registerHeader, offsets } = useColumnPinOffsets(
    table.getPinnedVisibleLeafColumns("start").map((column) => column.id),
    table.getPinnedVisibleLeafColumns("end").map((column) => column.id),
  )

  const handleSearch = (key: string, value: string) => {
    setSearches((current) => ({ ...current, [key]: value }))

    if (searchTimeouts.current[key]) {
      clearTimeout(searchTimeouts.current[key])
    }

    searchTimeouts.current[key] = setTimeout(() => {
      visit({ [key]: value, page: 1 })
    }, SEARCH_DEBOUNCE_MS)
  }

  return (
    <div className="flex flex-col gap-3">
      {toolbar && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {searchConfigs.map((search) => (
              <DataGridSearchInput
                key={search.key}
                placeholder={search.placeholder}
                value={searches[search.key] ?? ""}
                onChange={(value) => handleSearch(search.key, value)}
              />
            ))}
            {facets.map((facet) => {
              const applied = filters[facet.key]

              return (
                <FacetedFilter
                  key={facet.key}
                  title={facet.title}
                  options={facet.options}
                  variant={facet.variant}
                  appliedValues={
                    Array.isArray(applied) ? applied : applied ? [applied] : []
                  }
                  onApply={(values) => visit({ [facet.key]: values, page: 1 })}
                  onClear={() =>
                    visit({
                      [facet.key]: undefined,
                      page: 1,
                    })
                  }
                />
              )
            })}
            {selects.map((select) => {
              const applied = filters[select.key]
              const value = Array.isArray(applied)
                ? (applied[0] ?? null)
                : (applied ?? null)

              return (
                <SelectBox
                  key={select.key}
                  // `SelectBox` defaults its trigger to
                  // `w-full` for its form-control use case;
                  // here it sits beside `FacetedFilter`
                  // triggers, which shrink to their content,
                  // so it needs the same to look consistent.
                  className="w-auto"
                  options={select.options}
                  placeholder={select.placeholder}
                  clearable={select.clearable}
                  value={value}
                  onValueChange={(next) =>
                    visit({
                      // The backend filter is still
                      // `whereIn`-based, so a single
                      // pick still travels as a
                      // one-element array.
                      [select.key]: next ? [next] : undefined,
                      page: 1,
                    })
                  }
                />
              )
            })}
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
            {isPending ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className="p-0"
                >
                  <DataGridLoading />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
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
                    title={
                      isFiltered
                        ? (emptyFilteredTitle ?? emptyTitle)
                        : emptyTitle
                    }
                    description={
                      isFiltered
                        ? (emptyFilteredDescription ?? emptyDescription)
                        : emptyDescription
                    }
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pagination === "advance" && (
        <DataGridPaginationAdvance
          server={{
            total: paginated.total,
            from: paginated.from,
            to: paginated.to,
            currentPage: paginated.current_page,
            lastPage: paginated.last_page,
            perPage: paginated.per_page,
            canPrev: paginated.current_page > 1,
            canNext: paginated.current_page < paginated.last_page,
            onFirst: () => visit({ page: 1 }),
            onPrev: () => visit({ page: paginated.current_page - 1 }),
            onNext: () => visit({ page: paginated.current_page + 1 }),
            onLast: () => visit({ page: paginated.last_page }),
            onPageSizeChange: (size) => visit({ per_page: size, page: 1 }),
          }}
        />
      )}
      {pagination === "simple" && (
        <DataGridPaginationSimple
          server={{
            total: paginated.total,
            from: paginated.from,
            to: paginated.to,
            currentPage: paginated.current_page,
            lastPage: paginated.last_page,
            canPrev: paginated.current_page > 1,
            canNext: paginated.current_page < paginated.last_page,
            onPrev: () => visit({ page: paginated.current_page - 1 }),
            onNext: () => visit({ page: paginated.current_page + 1 }),
          }}
        />
      )}
    </div>
  )
}
