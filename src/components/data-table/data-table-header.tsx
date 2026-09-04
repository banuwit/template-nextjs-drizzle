import type * as React from "react"

import { TableHead } from "@/components/ui/table"
import { cn } from "@/lib/utils"

/** Text alignment classes shared by heads and cells. */
export const textAlignClass = {
  left: undefined,
  center: "text-center",
  right: "text-right",
} as const

export interface DataTableHeaderProps extends React.ComponentProps<
  typeof TableHead
> {
  align?: "left" | "center" | "right"
}

/**
 * A plain `<TableHead>`: label only, no sorting and no menu.
 *
 * Use it for columns that are not sortable — the counterpart to
 * {@link import('./data-table-header-sort').DataTableHeaderSort}. Both render a
 * full `<TableHead>`, so they can be mixed freely in the same header row.
 */
export function DataTableHeader({
  align = "left",
  className,
  children,
  ...props
}: DataTableHeaderProps) {
  return (
    <TableHead className={cn(textAlignClass[align], className)} {...props}>
      {children}
    </TableHead>
  )
}
