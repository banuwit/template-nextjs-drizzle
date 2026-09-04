"use client"

import * as React from "react"

import { useListNavigation, type QueryValue } from "@/hooks/use-list-navigation"

import { PAGE_SIZE, SEARCH_DEBOUNCE_MS } from "./constants"
import { DataTableBody } from "./data-table-body"
import type { SortDirection } from "./data-table-header-sort"
import { DataTablePaginationAdvance } from "./data-table-pagination-advance"
import { DataTablePaginationSimple } from "./data-table-pagination-simple"
import { DataTableToolbar } from "./data-table-toolbar"
import type {
  DataTableColumn,
  DataTableFilters,
  Paginated,
  ToolbarConfig,
} from "./types"

/**
 * Query defaults `queries.ts` already applies. Params matching a default are
 * dropped from the URL so the address bar stays clean.
 */
export interface DataTableServerDefaults {
  sort?: string
  direction?: SortDirection
  perPage?: number
}

export interface DataTableServerProps<TData> {
  columns: DataTableColumn<TData>[]
  /** Satu halaman hasil query, dibangun lewat `paginate()` di `@/lib/pagination`. */
  paginated: Paginated<TData>
  /** `searchParams` halaman ini, sudah di-await oleh Server Component. */
  filters: DataTableFilters
  /** Pathname tujuan, mis. `/users`. Default: pathname saat ini. */
  url?: string
  /** Stable React key per row. Defaults to the row index. */
  rowKey?: (row: TData, index: number) => React.Key
  toolbar?: ToolbarConfig
  /** Extra buttons rendered at the end of the toolbar row. */
  actions?: React.ReactNode
  /**
   * Default header style for sortable columns that don't set their own
   * `headerVariant`. Default: `'sort'`.
   */
  headerVariant?: "sort" | "dropdown"
  /** Pagination style, or `none` to hide it (e.g. the query returns every row already). Default: `advance`. */
  pagination?: "advance" | "simple" | "none"
  defaults?: DataTableServerDefaults
  /**
   * Show the page-size selector. Off by default: it sends `per_page`, which
   * silently does nothing unless `queries.ts` reads and applies it.
   */
  showPageSize?: boolean
  /** Shown when there are no rows and no search/facet is active. */
  emptyTitle?: string
  emptyDescription?: string
  /** Shown when there are no rows while a search or facet is active. Falls back to `emptyTitle`/`emptyDescription` when omitted. */
  emptyFilteredTitle?: string
  emptyFilteredDescription?: string
}

/**
 * A list over shadcn `Table` primitives whose sorting, searching, filtering,
 * and paging are all served by a Server Component through the query string.
 */
export function DataTableServer<TData>({
  columns,
  paginated,
  filters,
  url,
  rowKey,
  toolbar,
  actions,
  headerVariant,
  pagination = "advance",
  defaults = {},
  showPageSize = false,
  emptyTitle,
  emptyDescription,
  emptyFilteredTitle,
  emptyFilteredDescription,
}: DataTableServerProps<TData>) {
  const searchConfigs = React.useMemo(
    () => toolbar?.searches ?? [],
    [toolbar?.searches],
  )
  const facetConfigs = React.useMemo(
    () => toolbar?.facets ?? [],
    [toolbar?.facets],
  )

  // True when a search box or facet is currently narrowing the result set —
  // distinguishes "no rows in this filter" from "no rows at all" in the
  // empty state.
  const isFiltered =
    searchConfigs.some((search) => !!filters[search.key]) ||
    facetConfigs.some((facet) => {
      const value = filters[facet.key]

      return Array.isArray(value) ? value.length > 0 : !!value
    })

  // Search is debounced locally, so it needs its own state; everything else is
  // derived from the props the Server Component sent down.
  const [searchValues, setSearchValues] = React.useState<
    Record<string, string>
  >(() =>
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

  const facetValues = React.useMemo(() => {
    const entries = facetConfigs.map((facet) => {
      const applied = filters[facet.key]

      if (Array.isArray(applied)) {
        return [facet.key, applied] as const
      }

      return [facet.key, applied ? [applied] : []] as const
    })

    return Object.fromEntries(entries) as Record<string, string[]>
  }, [facetConfigs, filters])

  const handleSearchChange = (key: string, value: string) => {
    setSearchValues((current) => ({ ...current, [key]: value }))

    if (searchTimeouts.current[key]) {
      clearTimeout(searchTimeouts.current[key])
    }

    searchTimeouts.current[key] = setTimeout(() => {
      visit({ [key]: value, page: 1 })
    }, SEARCH_DEBOUNCE_MS)
  }

  const handleSort = (columnKey: string, direction: SortDirection) => {
    visit({ sort: columnKey, direction, page: 1 })
  }

  const perPage = Number(filters.per_page ?? paginated.per_page)

  return (
    <div className="flex flex-col gap-3">
      {toolbar && (
        <DataTableToolbar
          toolbar={toolbar}
          searchValues={searchValues}
          onSearchChange={handleSearchChange}
          facetValues={facetValues}
          onFacetApply={(key, values) => visit({ [key]: values, page: 1 })}
          onFacetClear={(key) => visit({ [key]: undefined, page: 1 })}
          actions={actions}
        />
      )}

      <DataTableBody
        columns={columns}
        rows={paginated.data}
        rowKey={rowKey}
        sort={filters.sort}
        direction={filters.direction === "asc" ? "asc" : "desc"}
        onSort={handleSort}
        headerVariant={headerVariant}
        isPending={isPending}
        emptyTitle={
          isFiltered ? (emptyFilteredTitle ?? emptyTitle) : emptyTitle
        }
        emptyDescription={
          isFiltered
            ? (emptyFilteredDescription ?? emptyDescription)
            : emptyDescription
        }
      />

      {pagination === "advance" && (
        <DataTablePaginationAdvance
          currentPage={paginated.current_page}
          lastPage={paginated.last_page}
          perPage={perPage}
          total={paginated.total}
          from={paginated.from}
          to={paginated.to}
          onPageChange={(page) => visit({ page })}
          onPageSizeChange={
            showPageSize
              ? (size) => visit({ per_page: size, page: 1 })
              : undefined
          }
        />
      )}
      {pagination === "simple" && (
        <DataTablePaginationSimple
          currentPage={paginated.current_page}
          lastPage={paginated.last_page}
          total={paginated.total}
          from={paginated.from}
          to={paginated.to}
          onPageChange={(page) => visit({ page })}
        />
      )}
    </div>
  )
}
