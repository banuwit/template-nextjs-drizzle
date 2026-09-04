import type { CellValue, DataTableColumn } from "./types"

/** Reads `row[key]` when the row is a plain object, otherwise `undefined`. */
function readKey<TData>(row: TData, key: string): unknown {
  if (row === null || typeof row !== "object") {
    return undefined
  }

  return (row as Record<string, unknown>)[key]
}

/** The value a column sorts by: its `sortValue`, else `row[key]`. */
export function resolveSortValue<TData>(
  column: DataTableColumn<TData>,
  row: TData,
): CellValue {
  if (column.sortValue) {
    return column.sortValue(row)
  }

  const value = readKey(row, column.key)

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    value instanceof Date ||
    value === null ||
    value === undefined
  ) {
    return value
  }

  return String(value)
}

/** The value(s) a column is searched and faceted by: its `filterValue`, else `row[key]`. */
export function resolveFilterValue<TData>(
  column: DataTableColumn<TData>,
  row: TData,
): string[] {
  const raw = column.filterValue
    ? column.filterValue(row)
    : readKey(row, column.key)

  if (raw === null || raw === undefined) {
    return []
  }

  if (Array.isArray(raw)) {
    return raw.map(String)
  }

  return [String(raw)]
}

/**
 * Orders two cell values ascending. Empty values always sort last regardless of
 * direction, so a descending sort does not surface a wall of blanks.
 */
export function compareValues(a: CellValue, b: CellValue): number {
  const aEmpty = a === null || a === undefined || a === ""
  const bEmpty = b === null || b === undefined || b === ""

  if (aEmpty || bEmpty) {
    if (aEmpty && bEmpty) {
      return 0
    }

    // Signals "keep last" to the caller, which re-inverts for descending.
    return aEmpty ? 1 : -1
  }

  if (a instanceof Date || b instanceof Date) {
    return Number(new Date(a as Date)) - Number(new Date(b as Date))
  }

  if (typeof a === "number" && typeof b === "number") {
    return a - b
  }

  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: "base",
  })
}

/** True when an empty value must stay at the bottom instead of being inverted. */
export function isEmptyValue(value: CellValue): boolean {
  return value === null || value === undefined || value === ""
}
