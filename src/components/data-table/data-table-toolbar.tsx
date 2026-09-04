import type * as React from "react"

import { FacetedFilter } from "@/components/filters/faceted-filter"

import { DataTableSearchInput } from "./data-table-search-input"
import type { ToolbarConfig } from "./types"

export interface DataTableToolbarProps {
  toolbar: ToolbarConfig
  /** Current text of each search input, keyed by `SearchConfig.key`. */
  searchValues: Record<string, string>
  onSearchChange: (key: string, value: string) => void
  /** Applied selection of each facet, keyed by `FacetConfig.key`. */
  facetValues: Record<string, string[]>
  onFacetApply: (key: string, values: string[]) => void
  onFacetClear: (key: string) => void
  /** Extra buttons rendered at the end of the toolbar row. */
  actions?: React.ReactNode
}

/**
 * The search + facet row shared by `DataTableClient` and `DataTableServer`.
 * Both drive it the same way; only what happens on change differs.
 */
export function DataTableToolbar({
  toolbar,
  searchValues,
  onSearchChange,
  facetValues,
  onFacetApply,
  onFacetClear,
  actions,
}: DataTableToolbarProps) {
  const searches = toolbar.searches ?? []
  const facets = toolbar.facets ?? []

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {searches.map((search) => (
          <DataTableSearchInput
            key={search.key}
            placeholder={search.placeholder}
            value={searchValues[search.key] ?? ""}
            onChange={(value) => onSearchChange(search.key, value)}
          />
        ))}
        {facets.map((facet) => (
          <FacetedFilter
            key={facet.key}
            title={facet.title}
            options={facet.options}
            variant={facet.variant}
            appliedValues={facetValues[facet.key] ?? []}
            onApply={(values) => onFacetApply(facet.key, values)}
            onClear={() => onFacetClear(facet.key)}
          />
        ))}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  )
}
