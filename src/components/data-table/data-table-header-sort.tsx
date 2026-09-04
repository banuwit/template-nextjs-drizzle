import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import type * as React from "react"

import { TableHead } from "@/components/ui/table"
import { cn } from "@/lib/utils"

export type SortDirection = "asc" | "desc"

export interface DataTableHeaderSortProps {
  /** The column this head sorts by. */
  columnKey: string
  /** The column currently sorted, if any. */
  sort?: string
  direction?: SortDirection
  onSort: (columnKey: string, direction: SortDirection) => void
  align?: "left" | "center" | "right"
  className?: string
  children: React.ReactNode
}

const alignClass = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
} as const

/**
 * A sortable `<TableHead>`. Clicking flips the direction on the active column
 * and starts ascending on any other, matching the manual list pages.
 *
 * Exported on its own so a hand-written table can reuse the same header without
 * adopting `DataTableClient` / `DataTableServer`.
 */
export function DataTableHeaderSort({
  columnKey,
  sort,
  direction = "desc",
  onSort,
  align = "left",
  className,
  children,
}: DataTableHeaderSortProps) {
  const isActive = sort === columnKey

  return (
    <TableHead
      className={cn(align === "right" && "text-right", className)}
      aria-sort={
        isActive ? (direction === "asc" ? "ascending" : "descending") : "none"
      }
    >
      <button
        type="button"
        className={cn(
          "inline-flex w-full items-center gap-1.5 rounded-sm font-medium hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
          alignClass[align],
        )}
        onClick={() =>
          onSort(columnKey, isActive && direction === "asc" ? "desc" : "asc")
        }
      >
        {children}
        {!isActive ? (
          <ArrowUpDown className="size-3.5 text-muted-foreground" />
        ) : direction === "asc" ? (
          <ArrowUp className="size-3.5" />
        ) : (
          <ArrowDown className="size-3.5" />
        )}
      </button>
    </TableHead>
  )
}
