import type {
  PaginationState,
  ReactTable,
  RowData,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"

import { PAGE_SIZE } from "./constants"
import type { DataGridFeatures } from "./data-grid-features"

export interface ServerPaginationSimple {
  total: number
  from: number | null
  to: number | null
  currentPage: number
  lastPage: number
  canPrev: boolean
  canNext: boolean
  onPrev: () => void
  onNext: () => void
}

interface DataGridPaginationSimpleProps<TData extends RowData> {
  table?: ReactTable<DataGridFeatures, TData>
  pagination?: PaginationState
  server?: ServerPaginationSimple
}

export function DataGridPaginationSimple<TData extends RowData>({
  table,
  pagination,
  server,
}: DataGridPaginationSimpleProps<TData>) {
  const isServer = !!server

  const totalRows = isServer
    ? server.total
    : (table?.getFilteredRowModel().rows.length ?? 0)

  const pageSize = pagination?.pageSize ?? PAGE_SIZE

  const pageIndex = isServer
    ? server.currentPage - 1
    : (pagination?.pageIndex ?? 0)

  const pageCount = isServer
    ? server.lastPage
    : Math.max(1, Math.ceil(totalRows / pageSize))

  const from = isServer
    ? (server.from ?? 0)
    : totalRows === 0
      ? 0
      : pageIndex * pageSize + 1

  const to = isServer
    ? (server.to ?? 0)
    : Math.min((pageIndex + 1) * pageSize, totalRows)

  const canPrev = isServer ? server.canPrev : pageIndex > 0
  const canNext = isServer ? server.canNext : pageIndex < pageCount - 1

  const handlePrev = () => (isServer ? server.onPrev() : table?.previousPage())
  const handleNext = () => (isServer ? server.onNext() : table?.nextPage())

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium">{from}</span> to{" "}
        <span className="font-medium">{to}</span> of{" "}
        <span className="font-medium">{totalRows}</span> results
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center justify-center text-sm font-medium">
          Page {pageIndex + 1} of {pageCount}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrev}
          disabled={!canPrev}
        >
          Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={!canNext}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
