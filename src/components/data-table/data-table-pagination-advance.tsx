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

import { PAGE_SIZE_OPTIONS } from "./constants"

export interface DataTablePaginationProps {
  /** 1-based. */
  currentPage: number
  lastPage: number
  perPage: number
  total: number
  from: number | null
  to: number | null
  onPageChange: (page: number) => void
  /**
   * Omit to hide the page-size selector. In server mode only pass this when
   * the controller actually validates and applies `per_page`.
   */
  onPageSizeChange?: (size: number) => void
}

export function DataTablePaginationAdvance({
  currentPage,
  lastPage,
  perPage,
  total,
  from,
  to,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps) {
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
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {pageCount}
        </span>
        {onPageSizeChange && (
          <Select
            value={`${perPage}`}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger size="sm" className="shadow-none">
              <SelectValue placeholder={perPage} />
            </SelectTrigger>
            <SelectContent side="top">
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Button
          variant="outline"
          size="icon"
          className="hidden size-8 shadow-none lg:flex"
          onClick={() => onPageChange(1)}
          disabled={!canPrev}
        >
          <span className="sr-only">Go to first page</span>
          <ChevronsLeft />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-8 shadow-none"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canPrev}
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-8 shadow-none"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canNext}
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRight />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="hidden size-8 shadow-none lg:flex"
          onClick={() => onPageChange(pageCount)}
          disabled={!canNext}
        >
          <span className="sr-only">Go to last page</span>
          <ChevronsRight />
        </Button>
      </div>
    </div>
  )
}
