import { Subscribe } from "@tanstack/react-table"
import type { Column, RowData } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import type { DataGridFeatures } from "./data-grid-features"
import { getSorted } from "./types"

interface DataGridHeaderSortProps<
  TData extends RowData,
  TValue,
> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<DataGridFeatures, TData, TValue>
  title: string
  /**
   * Sort direction supplied by the caller. Used by server-driven grids where
   * the sort lives in the Inertia props instead of the table store. When
   * omitted, the direction is read reactively from the table store.
   */
  sorted?: false | "asc" | "desc"
  onSortChange?: (desc: boolean) => void
}

function SortButton({
  title,
  sorted,
  className,
  onClick,
}: {
  title: string
  sorted: false | "asc" | "desc"
  className?: string
  onClick: () => void
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="ghost"
        size="sm"
        aria-sort={
          sorted === "desc"
            ? "descending"
            : sorted === "asc"
              ? "ascending"
              : undefined
        }
        className={cn("-ml-3 h-8", sorted ? "font-bold" : "font-medium")}
        onClick={onClick}
      >
        <span>{title}</span>
        {sorted === "desc" ? (
          <ArrowDown data-icon="inline-end" className="text-primary" />
        ) : sorted === "asc" ? (
          <ArrowUp data-icon="inline-end" className="text-primary" />
        ) : (
          <ChevronsUpDown data-icon="inline-end" className="opacity-40" />
        )}
      </Button>
    </div>
  )
}

export function DataGridHeaderSort<TData extends RowData, TValue>({
  column,
  title,
  sorted,
  onSortChange,
  className,
}: DataGridHeaderSortProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  const toggle = (current: false | "asc" | "desc") => {
    const desc = current === "asc"

    if (onSortChange) {
      onSortChange(desc)
    } else {
      column.toggleSorting(desc)
    }
  }

  if (sorted !== undefined) {
    return (
      <SortButton
        title={title}
        sorted={sorted}
        className={className}
        onClick={() => toggle(sorted)}
      />
    )
  }

  return (
    <Subscribe
      source={column.table.store}
      selector={(state) => getSorted(state.sorting, column.id)}
    >
      {(storeSorted) => (
        <SortButton
          title={title}
          sorted={storeSorted}
          className={className}
          onClick={() => toggle(storeSorted)}
        />
      )}
    </Subscribe>
  )
}
