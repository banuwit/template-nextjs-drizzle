import type { Column, RowData, Table } from "@tanstack/react-table"
import {
  ArrowLeft,
  ArrowLeftToLine,
  ArrowRight,
  ArrowRightToLine,
  Check,
  PinOff,
} from "lucide-react"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

import type { DataGridFeatures } from "./data-grid-features"

/**
 * Moves a column one slot within its own region (start-pinned, unpinned, or
 * end-pinned). Staying inside the region is what keeps "move left" from
 * silently unpinning a column, and picking the neighbour from the *visible*
 * columns is what keeps a hidden column from eating the move.
 *
 * The order that gets written back is the full leaf-column list, not just the
 * visible one, so hiding a column never drops it out of the order state.
 */
function moveColumn<TData extends RowData, TValue>(
  table: Table<DataGridFeatures, TData>,
  column: Column<DataGridFeatures, TData, TValue>,
  direction: -1 | 1,
): void {
  const region = column.getIsPinned() || "center"
  const siblings = table.getPinnedVisibleLeafColumns(region)
  const position = siblings.findIndex((sibling) => sibling.id === column.id)
  const neighbour = siblings[position + direction]

  if (!neighbour) {
    return
  }

  const current = table.store.state.columnOrder
  const order = current.length
    ? [...current]
    : table.getAllLeafColumns().map((leaf) => leaf.id)

  const from = order.indexOf(column.id)
  const to = order.indexOf(neighbour.id)

  if (from === -1 || to === -1) {
    return
  }

  order[from] = neighbour.id
  order[to] = column.id

  table.setColumnOrder(order)
}

interface DataGridColumnActionsProps<TData extends RowData, TValue> {
  column: Column<DataGridFeatures, TData, TValue>
  /** Current pin position — pass it in so the menu re-renders on change. */
  pinned: false | "start" | "end"
  enablePinning: boolean
  enableOrdering: boolean
}

/**
 * Pin / move items for a column's header dropdown. Labels say "left" and
 * "right" (what the user sees in an LTR layout); TanStack v9 calls the
 * regions `start` and `end`.
 */
export function DataGridColumnActions<TData extends RowData, TValue>({
  column,
  pinned,
  enablePinning,
  enableOrdering,
}: DataGridColumnActionsProps<TData, TValue>) {
  const table = column.table
  const canPin = enablePinning && column.getCanPin()
  const region = pinned || "center"
  const canMove =
    enableOrdering && table.getPinnedVisibleLeafColumns(region).length > 1

  if (!canPin && !canMove) {
    return null
  }

  return (
    <>
      {canPin && (
        <>
          <DropdownMenuItem onClick={() => column.pin("start")}>
            <ArrowLeftToLine />
            Pin to left
            {pinned === "start" && <Check className="ml-auto text-primary" />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.pin("end")}>
            <ArrowRightToLine />
            Pin to right
            {pinned === "end" && <Check className="ml-auto text-primary" />}
          </DropdownMenuItem>
          {pinned !== false && (
            <DropdownMenuItem onClick={() => column.pin(false)}>
              <PinOff />
              Unpin
            </DropdownMenuItem>
          )}
        </>
      )}
      {canMove && (
        <>
          <DropdownMenuItem
            disabled={column.getIsFirstColumn(region)}
            // Base UI `Menu.Item` has no `onSelect` — only `onClick` — and
            // `closeOnClick` defaults to `true`. Setting it `false` keeps the
            // menu open, so a column can be nudged several slots without
            // reopening it.
            closeOnClick={false}
            onClick={() => moveColumn(table, column, -1)}
          >
            <ArrowLeft />
            Move to left
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={column.getIsLastColumn(region)}
            closeOnClick={false}
            onClick={() => moveColumn(table, column, 1)}
          >
            <ArrowRight />
            Move to right
          </DropdownMenuItem>
        </>
      )}
    </>
  )
}
