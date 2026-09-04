import type * as React from "react"

import type {
  FilterOption,
  FilterSelectionVariant,
} from "@/components/filters/types"

export type { Paginated } from "@/types/pagination"

/** Values a column can be sorted or filtered by in client mode. */
export type CellValue = string | number | Date | null | undefined

export interface DataTableColumn<TData> {
  /** Stable id. Also the value sent as `sort` when the column is sortable. */
  key: string
  header: React.ReactNode
  cell: (row: TData, index: number) => React.ReactNode
  sortable?: boolean
  /**
   * Header style for a sortable column: a plain click-to-toggle button
   * (`DataTableHeaderSort`) or a dropdown with explicit Asc/Desc items
   * (`DataTableHeaderDropdown`). Ignored when `sortable` is not set —
   * non-sortable columns always render a plain label. Default: `'sort'`.
   */
  headerVariant?: "sort" | "dropdown"
  align?: "left" | "center" | "right"
  headClassName?: string
  cellClassName?: string
  /**
   * Client mode: the value this column sorts by. Defaults to `row[key]` when
   * the row is a plain object.
   */
  sortValue?: (row: TData) => CellValue
  /**
   * Client mode: the value(s) matched against the toolbar search and against
   * a facet selection keyed by this column. Defaults to `row[key]`.
   */
  filterValue?: (row: TData) => string | string[] | null | undefined
  /**
   * Client mode: include this column in the toolbar search. Defaults to true
   * for columns whose value resolves to a string.
   */
  searchable?: boolean
}

/**
 * Query string shape shared by every server-driven list page.
 */
export type DataTableFilters = {
  search?: string
  sort?: string
  direction?: string
  per_page?: string
  [key: string]: string | string[] | undefined
}

/** A facet's options are plain filter options — see `@/components/filters`. */
export type FacetOption = FilterOption

export interface FacetConfig {
  /** Matched against a column `key` in client mode; sent as a query param in server mode. */
  key: string
  title: string
  options: FacetOption[]
  variant?: FilterSelectionVariant
}

export interface SearchConfig {
  key: string
  placeholder: string
}

export interface ToolbarConfig {
  searches?: SearchConfig[]
  facets?: FacetConfig[]
}
