import type {
  PaginationState,
  ReactTable,
  RowData,
} from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { PAGE_SIZE, PAGE_SIZE_OPTIONS } from "./constants"
import type { DataGridFeatures } from "./data-grid-features"

export interface ServerPagination {
  total: number
  from: number | null
  to: number | null
  currentPage: number
  lastPage: number
  perPage: number
  canPrev: boolean
  canNext: boolean
  onFirst: () => void
  onPrev: () => void
  onNext: () => void
  onLast: () => void
  onPageSizeChange?: (size: number) => void
}

interface DataGridPaginationAdvanceProps<TData extends RowData> {
  table?: ReactTable<DataGridFeatures, TData>
  pagination?: PaginationState
  server?: ServerPagination
}

export function DataGridPaginationAdvance<TData extends RowData>({
  table,
  pagination,
  server,
}: DataGridPaginationAdvanceProps<TData>) {
  const isServer = !!server

  const totalRows = isServer
    ? server.total
    : (table?.getFilteredRowModel().rows.length ?? 0)

  const pageSize = isServer
    ? server.perPage
    : (pagination?.pageSize ?? PAGE_SIZE)

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

  const handleFirst = () =>
    isServer ? server.onFirst() : table?.setPageIndex(0)
  const handlePrev = () => (isServer ? server.onPrev() : table?.previousPage())
  const handleNext = () => (isServer ? server.onNext() : table?.nextPage())
  const handleLast = () =>
    isServer ? server.onLast() : table?.setPageIndex(pageCount - 1)
  const handlePageSize = (value: string) => {
    if (isServer) {
      server.onPageSizeChange?.(Number(value))
    } else {
      table?.setPageSize(Number(value))
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium">{from}</span> to{" "}
        <span className="font-medium">{to}</span> of{" "}
        <span className="font-medium">{totalRows}</span> results
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Page {pageIndex + 1} of {pageCount}
        </span>
        <Select
          value={`${pageSize}`}
          onValueChange={(value) => handlePageSize(String(value))}
        >
          <SelectTrigger size="sm" className="shadow-none">
            <SelectValue placeholder={pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={`${size}`}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          className="hidden size-8 shadow-none lg:flex"
          onClick={handleFirst}
          disabled={!canPrev}
        >
          <span className="sr-only">Go to first page</span>
          <ChevronsLeft />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-8 shadow-none"
          onClick={handlePrev}
          disabled={!canPrev}
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-8 shadow-none"
          onClick={handleNext}
          disabled={!canNext}
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRight />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="hidden size-8 shadow-none lg:flex"
          onClick={handleLast}
          disabled={!canNext}
        >
          <span className="sr-only">Go to last page</span>
          <ChevronsRight />
        </Button>
      </div>
    </div>
  )
}
