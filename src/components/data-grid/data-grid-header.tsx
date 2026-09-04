import type * as React from "react"

import { cn } from "@/lib/utils"

const justifyClass = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
} as const

export interface DataGridHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  align?: "left" | "center" | "right"
}

/**
 * A plain column header: label only, no sorting and no menu.
 *
 * Takes no `column` — unlike its sortable siblings it has nothing to read from
 * the table. Its height and typography match the ghost button rendered by
 * {@link import('./data-grid-header-sort').DataGridHeaderSort}, so a header row
 * that mixes sortable and plain columns still lines up.
 *
 * The grid renders the surrounding `<TableHead>`, so this returns only its
 * contents:
 *
 * ```tsx
 * columnHelper.accessor('status', {
 *     header: () => <DataGridHeader title="Status" />,
 * })
 * ```
 */
export function DataGridHeader({
  title,
  align = "left",
  className,
  ...props
}: DataGridHeaderProps) {
  return (
    <div
      className={cn(
        "flex h-8 items-center font-medium",
        justifyClass[align],
        className,
      )}
      {...props}
    >
      {title}
    </div>
  )
}
