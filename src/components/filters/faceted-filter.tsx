"use client"

import { Check, ChevronDown, Search } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

import type { FilterOption, FilterSelectionVariant } from "./types"

export interface FacetedFilterProps {
  title?: string
  options: FilterOption[]
  /** "single" renders radio indicators (max 1 selection); "multi" (default) uses checkboxes. */
  variant?: FilterSelectionVariant
  showHeader?: boolean
  /**
   * Controlled mode: the current selection, written back through
   * `onValueChange` as soon as the user applies.
   */
  value?: string[]
  onValueChange?: (value: string[]) => void
  /**
   * Apply mode: the applied selection is supplied by the caller and written
   * back via `onApply` / `onClear` instead of `onValueChange`. Use this when
   * applying has a side effect beyond storing the value (a server round-trip,
   * resetting a page index, …).
   */
  appliedValues?: string[]
  onApply?: (values: string[]) => void
  onClear?: () => void
  /** Fires when the popover opens/closes (used to lazy-load options). */
  onOpenChange?: (open: boolean) => void
  /** Show a loading state in the list while options are being fetched. */
  isLoading?: boolean
  /** Show an error state in the list if fetching options failed. */
  isError?: boolean
  /** Called when the list is scrolled near the bottom (infinite scroll). */
  onLoadMore?: () => void
  /** Whether there are more pages to load. */
  hasMore?: boolean
  /** Whether the next page is currently being fetched. */
  isFetchingMore?: boolean
  /**
   * Controlled search text. When `onSearchChange` is set, filtering is
   * delegated to the caller (options are rendered as-is instead of filtered
   * locally).
   */
  searchValue?: string
  onSearchChange?: (value: string) => void
  /** Forwarded to the trigger button, e.g. to stretch it inside a form field. */
  className?: string
  /** Ties the trigger to a `<Label htmlFor>` when used as a form control. */
  id?: string
  disabled?: boolean
  align?: "start" | "center" | "end"
}

/**
 * A popover multi/single select with search, apply, and reset.
 *
 * Deliberately free of any table coupling: it is driven by `value` /
 * `onValueChange` (or `appliedValues` / `onApply` / `onClear`), so it works as a
 * data-grid toolbar filter, a form control, or a standalone filter on a card
 * or page.
 */
export function FacetedFilter({
  title,
  options,
  variant = "multi",
  showHeader = false,
  value,
  onValueChange,
  appliedValues,
  onApply,
  onClear,
  onOpenChange,
  isLoading = false,
  isError = false,
  onLoadMore,
  hasMore = false,
  isFetchingMore = false,
  searchValue: controlledSearch,
  onSearchChange,
  className,
  id,
  disabled = false,
  align = "start",
}: FacetedFilterProps) {
  const singleSelect = variant === "single"
  const [open, setOpen] = React.useState(false)
  // Caller-driven search when `onSearchChange` is provided; otherwise filter locally.
  const isServerSearch = typeof onSearchChange === "function"
  const [internalSearch, setInternalSearch] = React.useState("")
  const searchValue = isServerSearch ? (controlledSearch ?? "") : internalSearch

  const setSearch = (next: string) => {
    if (isServerSearch) {
      onSearchChange(next)
    } else {
      setInternalSearch(next)
    }
  }

  const [selectedValues, setSelectedValues] = React.useState<Set<string>>(
    new Set(),
  )

  // Applied values come from `appliedValues` (apply mode) or `value`
  // (controlled mode) — in that priority order.
  const readApplied = () =>
    (appliedValues !== undefined ? appliedValues : value) ?? []

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    onOpenChange?.(next)

    if (next) {
      // Seed the temp selection from the applied values on open.
      setSelectedValues(new Set(readApplied()))
    } else {
      setSearch("") // reset the query when the popover closes
    }
  }

  // Infinite scroll: load the next page when scrolled near the bottom.
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (!onLoadMore || !hasMore || isFetchingMore) {
      return
    }

    const element = event.currentTarget

    if (element.scrollTop + element.clientHeight >= element.scrollHeight - 24) {
      onLoadMore()
    }
  }

  const writeApplied = (next: string[]) => {
    if (onApply) {
      onApply(next)
    } else {
      onValueChange?.(next)
    }
  }

  const clearApplied = () => {
    if (onClear) {
      onClear()
    } else {
      onValueChange?.([])
    }
  }

  const handleApply = () => {
    writeApplied(Array.from(selectedValues))
    setOpen(false)
  }

  const handleClear = () => {
    setSelectedValues(new Set())
  }

  const handleSelectAll = () => {
    setSelectedValues(new Set(options.map((option) => option.value)))
  }

  const handleReset = () => {
    clearApplied()
    setOpen(false)
  }

  const appliedSet = new Set(readApplied())

  // Caller-driven search: render options as-is (already filtered).
  // Local search: filter here.
  const filteredOptions = isServerSearch
    ? options
    : options.filter((option) =>
        option.label.toLowerCase().includes(searchValue.toLowerCase()),
      )

  const toggleOption = (optionValue: string) => {
    const isSelected = selectedValues.has(optionValue)

    if (singleSelect) {
      const nextSelected = new Set<string>()

      if (!isSelected) {
        nextSelected.add(optionValue)
      }

      setSelectedValues(nextSelected)

      return
    }

    const nextSelected = new Set(selectedValues)

    if (isSelected) {
      nextSelected.delete(optionValue)
    } else {
      nextSelected.add(optionValue)
    }

    setSelectedValues(nextSelected)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            variant="outline"
            disabled={disabled}
            className={className}
          />
        }
      >
        {title}
        <ChevronDown className="ml-2 h-4 w-4" />
        {appliedSet.size > 0 && (
          <>
            <Separator orientation="vertical" className="mx-2 h-8" />
            <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground tabular-nums">
              {appliedSet.size}
            </span>
          </>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[200px] gap-0 p-0" align={align}>
        {showHeader && (
          <div className="flex items-center justify-between border-b px-3 py-2">
            <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              Filters
            </span>
            {!singleSelect && (
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium text-primary hover:bg-transparent hover:underline"
                  onClick={handleSelectAll}
                >
                  All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium text-muted-foreground hover:bg-transparent hover:underline"
                  onClick={handleClear}
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
        )}
        <div className="p-2 pb-0">
          <div className="relative">
            <Search className="absolute top-2.5 left-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              autoFocus
              placeholder={`Search ${title}...`}
              value={searchValue}
              onChange={(event) => setSearch(event.target.value)}
              className="h-8 pl-8 shadow-none focus-visible:ring-0"
            />
          </div>
        </div>
        <div
          className="max-h-[300px] overflow-y-auto overscroll-contain p-1"
          onScroll={handleScroll}
        >
          <div className="flex flex-col gap-0.5">
            {filteredOptions.length === 0 ? (
              <div
                className={cn(
                  "py-6 text-center",
                  isError ? "text-destructive" : "text-muted-foreground",
                )}
              >
                {isLoading
                  ? "Loading..."
                  : isError
                    ? "Failed to load. Try again."
                    : "No results found."}
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selectedValues.has(option.value)

                return (
                  <div
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={0}
                    className={cn(
                      "flex cursor-pointer items-center rounded-sm px-2 py-1.5 outline-none hover:bg-accent hover:text-accent-foreground",
                      isSelected && "bg-accent/50",
                    )}
                    onClick={() => toggleOption(option.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault()
                        toggleOption(option.value)
                      }
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex size-3.5 items-center justify-center border",
                        singleSelect ? "rounded-full" : "rounded-none",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input",
                      )}
                    >
                      {isSelected &&
                        (singleSelect ? (
                          <div className="h-1 w-1 rounded-full bg-current" />
                        ) : (
                          <Check className="h-3 w-3" />
                        ))}
                    </div>
                    {option.icon && (
                      <option.icon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <span className="flex-1 truncate">{option.label}</span>
                  </div>
                )
              })
            )}
            {isFetchingMore && (
              <div className="py-2 text-center text-xs text-muted-foreground">
                Loading more...
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 border-t p-2">
          <Button
            variant="ghost"
            className="h-8 flex-1 bg-destructive/5 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button
            className="h-8 flex-1 bg-primary text-primary-foreground hover:bg-primary/80 dark:bg-primary/80 dark:text-primary-foreground dark:hover:bg-primary"
            onClick={handleApply}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
