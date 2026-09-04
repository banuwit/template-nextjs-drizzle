import { Button } from "@/components/ui/button"

import type { DataTablePaginationProps } from "./data-table-pagination-advance"

type DataTablePaginationSimpleProps = Omit<
  DataTablePaginationProps,
  "perPage" | "onPageSizeChange"
>

export function DataTablePaginationSimple({
  currentPage,
  lastPage,
  total,
  from,
  to,
  onPageChange,
}: DataTablePaginationSimpleProps) {
  const pageCount = Math.max(1, lastPage)
  const canPrev = currentPage > 1
  const canNext = currentPage < pageCount

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium">{from ?? 0}</span> to{" "}
        <span className="font-medium">{to ?? 0}</span> of{" "}
        <span className="font-medium">{total}</span> results
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center justify-center text-sm font-medium">
          Page {currentPage} of {pageCount}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canPrev}
        >
          Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canNext}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
