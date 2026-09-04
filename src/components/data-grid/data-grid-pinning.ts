import type { ColumnPinningPosition } from "@tanstack/react-table"
import * as React from "react"

import { cn } from "@/lib/utils"

export interface PinOffset {
  left?: number
  right?: number
  isLastStart?: boolean
  isFirstEnd?: boolean
}

export type PinOffsets = Record<string, PinOffset>

/**
 * Measures the rendered width of each pinned header cell and turns it into the
 * `left` / `right` offset its sticky column needs.
 *
 * Widths are measured instead of read from a declared `size` on purpose: the
 * grid lets the browser size columns automatically, and forcing a width on
 * pinned columns would make them jump the moment they are pinned.
 *
 * @param startIds Ids of the start-pinned visible columns, in visual order.
 * @param endIds Ids of the end-pinned visible columns, in visual order.
 */
export function useColumnPinOffsets(startIds: string[], endIds: string[]) {
  const nodes = React.useRef(new Map<string, HTMLTableCellElement>())
  const observer = React.useRef<ResizeObserver | null>(null)
  const [widths, setWidths] = React.useState<Record<string, number>>({})

  const measure = React.useCallback(() => {
    setWidths((current) => {
      const next: Record<string, number> = {}
      let changed = false

      nodes.current.forEach((node, id) => {
        next[id] = node.getBoundingClientRect().width

        if (next[id] !== current[id]) {
          changed = true
        }
      })

      if (
        !changed &&
        Object.keys(next).length === Object.keys(current).length
      ) {
        return current
      }

      return next
    })
  }, [])

  React.useEffect(() => {
    const resizeObserver = new ResizeObserver(() => measure())

    observer.current = resizeObserver
    nodes.current.forEach((node) => resizeObserver.observe(node))
    measure()

    return () => {
      resizeObserver.disconnect()
      observer.current = null
    }
  }, [measure])

  // One stable callback per column id. Handing React a fresh callback each
  // render would make it detach and re-attach — and so unobserve and
  // re-observe — every header on every render.
  const callbacks = React.useRef(
    new Map<string, (node: HTMLTableCellElement | null) => void>(),
  )

  /** Ref callback for a header cell; pass the column id, not the header id. */
  const registerHeader = React.useCallback((columnId: string) => {
    const cached = callbacks.current.get(columnId)

    if (cached) {
      return cached
    }

    const callback = (node: HTMLTableCellElement | null) => {
      const previous = nodes.current.get(columnId)

      if (previous) {
        observer.current?.unobserve(previous)
        nodes.current.delete(columnId)
      }

      if (node) {
        nodes.current.set(columnId, node)
        observer.current?.observe(node)
      }
    }

    callbacks.current.set(columnId, callback)

    return callback
  }, [])

  const offsets = React.useMemo<PinOffsets>(() => {
    const result: PinOffsets = {}

    let left = 0
    startIds.forEach((id, index) => {
      result[id] = { left, isLastStart: index === startIds.length - 1 }
      left += widths[id] ?? 0
    })

    let right = 0
    ;[...endIds].reverse().forEach((id, index) => {
      result[id] = { right, isFirstEnd: index === endIds.length - 1 }
      right += widths[id] ?? 0
    })

    return result
  }, [startIds, endIds, widths])

  return { registerHeader, offsets }
}

/**
 * The row's `hover` / `aria-expanded` tint, flattened against the page
 * background.
 *
 * A pinned cell has to stay fully opaque or the columns scrolling underneath
 * show through it. Re-applying the row's own translucent `bg-muted/50` would
 * break that: the `<tr>` already paints that tint behind the cell, so a second
 * translucent layer on top composites twice and the pinned column reads as a
 * darker overlay than the rest of the row. Mixing the same tint down to an
 * opaque colour lands on exactly the shade the rest of the row shows.
 */
// Written out in full, twice: Tailwind only generates classes it can find as
// complete literals in the source, so these cannot be built by interpolation.
const ROW_TINT_CLASSES =
  "group-hover/row:bg-[color-mix(in_srgb,var(--muted)_50%,var(--background))] group-has-[[aria-expanded=true]]/row:bg-[color-mix(in_srgb,var(--muted)_50%,var(--background))]"

/**
 * Sticky positioning for one pinned header or body cell. Returns empty props
 * for unpinned columns so the caller can spread unconditionally.
 */
export function getPinnedCellProps(
  pinned: ColumnPinningPosition,
  offsets: PinOffsets,
  columnId: string,
  { isHeader = false }: { isHeader?: boolean } = {},
): { className?: string; style?: React.CSSProperties } {
  if (!pinned) {
    return {}
  }

  const offset = offsets[columnId]

  return {
    className: cn(
      "sticky",
      isHeader
        ? "z-20 bg-muted"
        : cn(
            "z-10 bg-background group-data-[state=selected]/row:bg-muted",
            ROW_TINT_CLASSES,
          ),
      offset?.isLastStart && "shadow-[inset_-1px_0_0_0_var(--border)]",
      offset?.isFirstEnd && "shadow-[inset_1px_0_0_0_var(--border)]",
    ),
    style:
      pinned === "start"
        ? { left: offset?.left ?? 0 }
        : { right: offset?.right ?? 0 },
  }
}
