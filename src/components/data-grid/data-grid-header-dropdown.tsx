import { Subscribe } from "@tanstack/react-table"
import type {
  Column,
  ColumnVisibilityState,
  RowData,
  Table,
} from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ChevronsUpDown, Pin, PinOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

import { DataGridColumnActions } from "./data-grid-column-actions"
import type { DataGridFeatures } from "./data-grid-features"
import { DataGridVisibilityHeader } from "./data-grid-visibility-header"
import { getSorted } from "./types"

interface DataGridHeaderDropdownProps<
  TData extends RowData,
  TValue,
> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<DataGridFeatures, TData, TValue>
  title: string
  /**
   * Sort direction supplied by the caller (server-driven grids). When
   * omitted, the direction is read reactively from the table store.
   */
  sorted?: false | "asc" | "desc"
  onSortChange?: (desc: boolean) => void
  /**
   * Show the "View columns" submenu (column visibility toggle) inside this
   * column's dropdown. Overrides the grid's `showHeaderVisibilityToggle`.
   */
  showVisibilityToggle?: boolean
  /**
   * Show the pin / move items. Overrides the grid's `enableColumnPinning`
   * and `enableColumnOrdering`.
   */
  showColumnActions?: boolean
  /** Defaults to `column.table`; only pass this to target another table. */
  table?: Table<DataGridFeatures, TData>
  columnVisibility?: ColumnVisibilityState
}

export function DataGridHeaderDropdown<TData extends RowData, TValue>({
  column,
  title,
  sorted,
  onSortChange,
  showVisibilityToggle,
  showColumnActions,
  table = column.table,
  columnVisibility,
  className,
}: DataGridHeaderDropdownProps<TData, TValue>) {
  const meta = table.options.meta ?? {}
  const canSort = column.getCanSort()
  const showVisibility =
    showVisibilityToggle ?? meta.showHeaderVisibilityToggle ?? true
  const allowColumnActions = showColumnActions ?? true
  const enablePinning =
    allowColumnActions && (meta.enableColumnPinning ?? false)
  const enableOrdering =
    allowColumnActions && (meta.enableColumnOrdering ?? false)
  const hasColumnActions = enablePinning || enableOrdering

  // Nothing to put in a menu — fall back to a plain label.
  if (!canSort && !hasColumnActions && !showVisibility) {
    return <div className={cn(className)}>{title}</div>
  }

  const sort = (desc: boolean) => {
    if (onSortChange) {
      onSortChange(desc)
    } else {
      column.toggleSorting(desc)
    }
  }

  const renderMenu = (
    current: false | "asc" | "desc",
    pinned: false | "start" | "end",
  ) => {
    const showPinIndicator = enablePinning && pinned

    return (
      <div
        className={cn(
          "flex h-8 items-center gap-2",
          showPinIndicator && "justify-between",
          className,
        )}
      >
        <DropdownMenu>
          {/* `aria-sort` sengaja tidak dipasang di sini: atribut itu hanya
              valid di `<th>`, dan grid-lah yang merender `<TableHead>`. */}
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "-ml-3 h-8",
                  current ? "font-bold" : "font-medium",
                )}
              />
            }
          >
            <span>{title}</span>
            {current === "desc" ? (
              <ArrowDown data-icon="inline-end" className="text-primary" />
            ) : current === "asc" ? (
              <ArrowUp data-icon="inline-end" className="text-primary" />
            ) : canSort ? (
              <ChevronsUpDown data-icon="inline-end" className="opacity-40" />
            ) : null}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            finalFocus={false}
            className="w-40"
          >
            {canSort && (
              <>
                <DropdownMenuItem onClick={() => sort(false)}>
                  <ArrowUp />
                  Asc
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => sort(true)}>
                  <ArrowDown />
                  Desc
                </DropdownMenuItem>
              </>
            )}
            {hasColumnActions && (
              <>
                {canSort && <DropdownMenuSeparator />}
                <DataGridColumnActions
                  column={column}
                  pinned={pinned}
                  enablePinning={enablePinning}
                  enableOrdering={enableOrdering}
                />
              </>
            )}
            {showVisibility && (
              <>
                {(canSort || hasColumnActions) && <DropdownMenuSeparator />}
                <DataGridVisibilityHeader
                  table={table}
                  columnVisibility={columnVisibility}
                />
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        {showPinIndicator && (
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={`Unpin ${title}`}
            title={`Unpin ${title}`}
            onClick={() => column.pin(false)}
            className="group/pin -mr-1 shrink-0 text-primary hover:text-destructive/70"
          >
            <Pin className="fill-current group-hover/pin:hidden" />
            <PinOff className="hidden group-hover/pin:block" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <Subscribe
      source={column.table.store}
      selector={(state) => ({
        // Reading these as primitives keeps `Subscribe`'s shallow
        // compare from re-rendering on every unrelated state write.
        sorted: sorted ?? getSorted(state.sorting, column.id),
        pinned: state.columnPinning.start.includes(column.id)
          ? ("start" as const)
          : state.columnPinning.end.includes(column.id)
            ? ("end" as const)
            : (false as const),
        // The order itself is not rendered, but "move" enable/disable
        // and neighbour lookups derive from it.
        order: state.columnOrder.join(","),
        hidden: Object.entries(state.columnVisibility)
          .filter(([, visible]) => !visible)
          .map(([id]) => id)
          .join(","),
      })}
    >
      {({ sorted: storeSorted, pinned }) => renderMenu(storeSorted, pinned)}
    </Subscribe>
  )
}
