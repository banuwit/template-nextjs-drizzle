import {
  columnFilteringFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnVisibilityFeature,
  constructFilterFn,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_text,
  tableFeatures,
} from "@tanstack/react-table"

/**
 * Keeps rows whose column value is one of the selected facet values.
 *
 * Backs the `multiValue` filter used by the toolbar's `FacetedFilter`: an empty
 * selection means "no filter", so it is auto-removed from filter state.
 */
const filterFn_multiValue = constructFilterFn({
  filter: (dataValue, filterValue: string[]) => {
    if (!filterValue?.length) {
      return true
    }

    return filterValue.includes(dataValue as string)
  },
  autoRemove: (filterValue) =>
    !Array.isArray(filterValue) || filterValue.length === 0,
})

/**
 * Page-level switches the grid puts on `table.options.meta` so header
 * components can read them from `column.table` without every column def
 * having to forward a prop.
 */
export interface DataGridMeta {
  enableColumnPinning?: boolean
  enableColumnOrdering?: boolean
  showHeaderVisibilityToggle?: boolean
}

// New in v9: declare the features this grid uses — anything you don't
// register is tree-shaken out of the bundle.
export const features = tableFeatures({
  columnFilteringFeature,
  // `columnOrderingFeature` + `columnPinningFeature` back the Pin / Move
  // items in the header dropdown. Sticky offsets are measured at runtime
  // (see `data-grid-pinning.ts`), so `columnSizingFeature` is deliberately
  // left out — it would force every pinned column to its declared `size`.
  columnOrderingFeature,
  columnPinningFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns: {
    includesString: filterFn_includesString,
    multiValue: filterFn_multiValue,
  },
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
  // Type-only slot: gives `table.options.meta` the shape above.
  tableMeta: {} as DataGridMeta,
})

// Pass this as the first generic argument to `ColumnDef`, `Column`, `Table`,
// and `Row` so each type knows which feature APIs are available.
export type DataGridFeatures = typeof features
