import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react"
import type * as React from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TableHead } from "@/components/ui/table"
import { cn } from "@/lib/utils"

import type { SortDirection } from "./data-table-header-sort"

export interface DataTableHeaderDropdownProps {
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

/**
 * A sortable `<TableHead>` that opens a dropdown with explicit Asc/Desc items,
 * instead of `DataTableHeaderSort`'s single click-to-toggle button.
 *
 * Same props as `DataTableHeaderSort` — the two are interchangeable per
 * column via `DataTableColumn.headerVariant`. Unlike `DataGridHeaderDropdown`,
 * this has no column-visibility submenu: `data-table` doesn't have that
 * feature, so the dropdown here is sort-only.
 */
export function DataTableHeaderDropdown({
  columnKey,
  sort,
  direction = "desc",
  onSort,
  align = "left",
  className,
  children,
}: DataTableHeaderDropdownProps) {
  const isActive = sort === columnKey

  return (
    <TableHead
      className={cn(align === "right" && "text-right", className)}
      aria-sort={
        isActive ? (direction === "asc" ? "ascending" : "descending") : "none"
      }
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "-ml-3 h-8",
                isActive
                  ? "font-semibold text-foreground"
                  : "font-normal text-muted-foreground",
              )}
            />
          }
        >
          <span>{children}</span>
          {isActive && direction === "asc" ? (
            <ArrowUp className="text-primary" />
          ) : isActive ? (
            <ArrowDown className="text-primary" />
          ) : (
            <ChevronsUpDown className="opacity-40" />
          )}
        </DropdownMenuTrigger>
        {/* Base UI: keluar dari menu tidak memindahkan fokus balik ke trigger,
            supaya header tidak "melompat" setelah memilih arah sort. */}
        <DropdownMenuContent align="start" finalFocus={false}>
          <DropdownMenuItem onClick={() => onSort(columnKey, "asc")}>
            <ArrowUp />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSort(columnKey, "desc")}>
            <ArrowDown />
            Desc
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TableHead>
  )
}
