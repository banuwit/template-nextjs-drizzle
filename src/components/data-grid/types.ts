import type { SortingState } from "@tanstack/react-table"

import type {
  FilterOption,
  FilterSelectionVariant,
  SelectOption,
} from "@/components/filters/types"

export type { Paginated } from "@/types/pagination"

/**
 * Query string shape shared by every server-driven list page.
 */
export type DataGridFilters = {
  search?: string
  sort?: string
  direction?: string
  per_page?: string
  [key: string]: string | string[] | undefined
}

/** A facet's options are plain filter options — see `@/components/filters`. */
export type FacetOption = FilterOption

export interface FacetConfig {
  key: string
  title: string
  options: FacetOption[]
  variant?: FilterSelectionVariant
}

export interface SearchConfig {
  key: string
  placeholder: string
}

/**
 * A single-pick filter rendered as a `SelectBox` instead of a `FacetedFilter`
 * — the choice applies immediately, no Apply step. The backend value still
 * travels as a one-element array (`key[]=value`) so a `whereIn`-based filter
 * needs no backend change to go from multi- to single-select.
 */
export interface SelectConfig {
  key: string
  placeholder?: string
  options: SelectOption[]
  clearable?: boolean
}

export interface ToolbarConfig {
  searches?: SearchConfig[]
  facets?: FacetConfig[]
  selects?: SelectConfig[]
}

export function getSorted(
  sorting: SortingState,
  columnId: string,
): false | "asc" | "desc" {
  const entry = sorting.find((sort) => sort.id === columnId)

  if (!entry) {
    return false
  }

  return entry.desc ? "desc" : "asc"
}
