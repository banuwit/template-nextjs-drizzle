"use client"

import * as React from "react"

import { PAGE_SIZE } from "./constants"
import { DataTableBody } from "./data-table-body"
import type { SortDirection } from "./data-table-header-sort"
import { DataTablePaginationAdvance } from "./data-table-pagination-advance"
import { DataTablePaginationSimple } from "./data-table-pagination-simple"
import { DataTableToolbar } from "./data-table-toolbar"
import type { DataTableColumn, ToolbarConfig } from "./types"
import {
  compareValues,
  isEmptyValue,
  resolveFilterValue,
  resolveSortValue,
} from "./utils"

export interface DataTableClientProps<TData> {
  columns: DataTableColumn<TData>[]
  /** The full data set — sorting, searching, and paging all happen in memory. */
  data: TData[]
  /** Stable React key per row. Defaults to the row index. */
  rowKey?: (row: TData, index: number) => React.Key
  toolbar?: ToolbarConfig
  defaultSort?: { key: string; direction?: SortDirection }
  /**
   * Default header style for sortable columns that don't set their own
   * `headerVariant`. Default: `'sort'`.
   */
  headerVariant?: "sort" | "dropdown"
  /** Extra buttons rendered at the end of the toolbar row. */
  actions?: React.ReactNode
  /** Pagination style, or `none` to render every row. Default: `advance`. */
  pagination?: "advance" | "simple" | "none"
  pageSize?: number
  /** Shown when `data` itself is empty. */
  emptyTitle?: string
  emptyDescription?: string
  /** Shown when `data` has rows but the current search/filter matches none. Falls back to `emptyTitle`/`emptyDescription` when omitted. */
  emptyFilteredTitle?: string
  emptyFilteredDescription?: string
}

/**
 * A list over shadcn `Table` primitives that owns its own sorting, searching,
 * filtering, and paging. Use it when the page already holds every row; reach
 * for `DataTableServer` when the server paginates.
 */
export function DataTableClient<TData>({
  columns,
  data,
  rowKey,
  toolbar,
  defaultSort,
  headerVariant,
  actions,
  pagination = "advance",
  pageSize: initialPageSize = PAGE_SIZE,
  emptyTitle,
  emptyDescription,
  emptyFilteredTitle,
  emptyFilteredDescription,
}: DataTableClientProps<TData>) {
  const searchConfigs = React.useMemo(
    () => toolbar?.searches ?? [],
    [toolbar?.searches],
  )
  const facetConfigs = React.useMemo(
    () => toolbar?.facets ?? [],
    [toolbar?.facets],
  )

  const [sort, setSort] = React.useState<string | undefined>(defaultSort?.key)
  const [direction, setDirection] = React.useState<SortDirection>(
    defaultSort?.direction ?? "asc",
  )
  const [searchValues, setSearchValues] = React.useState<
    Record<string, string>
  >({})
  const [facetValues, setFacetValues] = React.useState<
    Record<string, string[]>
  >({})
  const [page, setPage] = React.useState(1)
  const [perPage, setPerPage] = React.useState(initialPageSize)

  const columnByKey = React.useMemo(() => {
    const map = new Map<string, DataTableColumn<TData>>()

    columns.forEach((column) => map.set(column.key, column))

    return map
  }, [columns])

  const searchableColumns = React.useMemo(
    () =>
      columns.filter((column) => column.searchable ?? column.key !== "actions"),
    [columns],
  )

  const filtered = React.useMemo(() => {
    let rows = data

    // A search whose key matches a column filters that column; any other key
    // (e.g. a single "search" box) matches across every searchable column.
    searchConfigs.forEach((config) => {
      const term = (searchValues[config.key] ?? "").trim().toLowerCase()

      if (term === "") {
        return
      }

      const scoped = columnByKey.get(config.key)
      const targets = scoped ? [scoped] : searchableColumns

      rows = rows.filter((row) =>
        targets.some((column) =>
          resolveFilterValue(column, row).some((value) =>
            value.toLowerCase().includes(term),
          ),
        ),
      )
    })

    facetConfigs.forEach((config) => {
      const selected = facetValues[config.key] ?? []

      if (selected.length === 0) {
        return
      }

      const column = columnByKey.get(config.key)

      if (!column) {
        return
      }

      rows = rows.filter((row) =>
        resolveFilterValue(column, row).some((value) =>
          selected.includes(value),
        ),
      )
    })

    return rows
  }, [
    data,
    searchConfigs,
    searchValues,
    facetConfigs,
    facetValues,
    columnByKey,
    searchableColumns,
  ])

  const sorted = React.useMemo(() => {
    const column = sort ? columnByKey.get(sort) : undefined

    if (!column) {
      return filtered
    }

    return [...filtered].sort((a, b) => {
      const aValue = resolveSortValue(column, a)
      const bValue = resolveSortValue(column, b)
      const result = compareValues(aValue, bValue)

      // Empty values stay at the bottom in both directions.
      if (isEmptyValue(aValue) || isEmptyValue(bValue)) {
        return result
      }

      return direction === "asc" ? result : -result
    })
  }, [filtered, sort, direction, columnByKey])

  const total = sorted.length
  const paginate = pagination !== "none"
  const lastPage = paginate ? Math.max(1, Math.ceil(total / perPage)) : 1
  const currentPage = Math.min(page, lastPage)

  const rows = React.useMemo(() => {
    if (!paginate) {
      return sorted
    }

    const start = (currentPage - 1) * perPage

    return sorted.slice(start, start + perPage)
  }, [sorted, paginate, currentPage, perPage])

  const from = total === 0 ? 0 : (currentPage - 1) * perPage + 1
  const to = paginate ? Math.min(currentPage * perPage, total) : total

  const handleSort = (columnKey: string, nextDirection: SortDirection) => {
    setSort(columnKey)
    setDirection(nextDirection)
    setPage(1)
  }

  const handleSearchChange = (key: string, value: string) => {
    setSearchValues((current) => ({ ...current, [key]: value }))
    setPage(1)
  }

  const handleFacetApply = (key: string, values: string[]) => {
    setFacetValues((current) => ({ ...current, [key]: values }))
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-3">
      {toolbar && (
        <DataTableToolbar
          toolbar={toolbar}
          searchValues={searchValues}
          onSearchChange={handleSearchChange}
          facetValues={facetValues}
          onFacetApply={handleFacetApply}
          onFacetClear={(key) => handleFacetApply(key, [])}
          actions={actions}
        />
      )}

      <DataTableBody
        columns={columns}
        rows={rows}
        rowKey={rowKey}
        sort={sort}
        direction={direction}
        onSort={handleSort}
        headerVariant={headerVariant}
        emptyTitle={
          data.length === 0 ? emptyTitle : (emptyFilteredTitle ?? emptyTitle)
        }
        emptyDescription={
          data.length === 0
            ? emptyDescription
            : (emptyFilteredDescription ?? emptyDescription)
        }
      />

      {paginate && pagination === "advance" && (
        <DataTablePaginationAdvance
          currentPage={currentPage}
          lastPage={lastPage}
          perPage={perPage}
          total={total}
          from={from}
          to={to}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPerPage(size)
            setPage(1)
          }}
        />
      )}

      {paginate && pagination === "simple" && (
        <DataTablePaginationSimple
          currentPage={currentPage}
          lastPage={lastPage}
          total={total}
          from={from}
          to={to}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}