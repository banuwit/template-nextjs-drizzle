import { Subscribe, type Column, type RowData } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { type DataTableFeatures } from "./data-table-features"

interface DataTableColumnHeaderProps<TData extends RowData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<DataTableFeatures, TData, TValue>
  title: string
}

function sortDirection(
  sorting: Array<{ id: string; desc: boolean }>,
  columnId: string,
): false | "asc" | "desc" {
  const sort = sorting.find((item) => item.id === columnId)

  if (!sort) {
    return false
  }

  return sort.desc ? "desc" : "asc"
}

export function DataTableColumnHeader<TData extends RowData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  return (
    <Subscribe
      source={column.table.store}
      selector={(state) => sortDirection(state.sorting, column.id)}
    >
      {(sorted) => (
        <div className={cn("flex items-center gap-2", className)}>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  aria-sort={
                    sorted === "desc"
                      ? "descending"
                      : sorted === "asc"
                        ? "ascending"
                        : "none"
                  }
                  className={cn(
                    "-ml-3 h-8 aria-expanded:bg-transparent aria-expanded:text-foreground",
                    "focus-visible:border-transparent focus-visible:ring-0",
                    sorted && "text-primary font-bold",
                  )}
                />
              }
            >
              <span>{title}</span>
              {sorted === "desc" ? (
                <ArrowDown data-icon="inline-end" />
              ) : sorted === "asc" ? (
                <ArrowUp data-icon="inline-end" />
              ) : (
                <ChevronsUpDown
                  data-icon="inline-end"
                  className="text-muted-foreground"
                />
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => column.toggleSorting(false)}
                  className={cn(sorted === "asc")}
                >
                  <ArrowUp />
                  Asc
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => column.toggleSorting(true)}
                  className={cn(sorted === "desc")}
                >
                  <ArrowDown />
                  Desc
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => column.toggleVisibility(false)}
                >
                  <EyeOff />
                  Hide
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </Subscribe>
  )
}
