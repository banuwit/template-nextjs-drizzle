"use client"

import { Check, ChevronDown, X } from "lucide-react"
import * as React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

import type { SelectOption } from "./types"

const triggerSizeClass = {
  sm: "h-7 px-2 text-xs",
  default: "h-8 px-2.5",
  lg: "h-9 px-3",
} as const

interface SelectBoxBaseProps {
  options: SelectOption[]
  /** Adds a search box above the list. */
  searchable?: boolean
  searchPlaceholder?: string
  /** Trigger text when nothing is selected. */
  placeholder?: string
  emptyMessage?: string
  size?: keyof typeof triggerSizeClass
  /** Shows an inline clear button once something is selected. */
  clearable?: boolean
  disabled?: boolean
  /** Marks the trigger invalid, for form validation. */
  invalid?: boolean
  /** Which side of an option its selected indicator sits on. */
  indicatorSide?: "left" | "right"
  /** Renders hidden inputs so the value posts with a native form. */
  name?: string
  id?: string
  className?: string
  contentClassName?: string
  align?: "start" | "center" | "end"
  /** Draw a separator between option groups. Default: true. */
  showGroupSeparator?: boolean
}

interface SelectBoxSingleProps extends SelectBoxBaseProps {
  mode?: "single"
  value?: string | null
  onValueChange?: (value: string | null) => void
}

interface SelectBoxMultiProps extends SelectBoxBaseProps {
  mode: "multi"
  value?: string[]
  onValueChange?: (value: string[]) => void
  /** How many chips the trigger shows before collapsing to "+N". Default: 2. */
  maxChips?: number
  /** Keep the list open after each pick. Default: true. */
  keepOpenOnSelect?: boolean
}

export type SelectBoxProps = SelectBoxSingleProps | SelectBoxMultiProps

function OptionAdornment({ option }: { option: SelectOption }) {
  if (option.avatar) {
    return (
      <Avatar size="sm">
        {option.avatar.src && <AvatarImage src={option.avatar.src} />}
        <AvatarFallback>{option.avatar.fallback}</AvatarFallback>
      </Avatar>
    )
  }

  if (option.color) {
    return (
      <span
        className={cn("size-2 shrink-0 rounded-full", option.color)}
        aria-hidden
      />
    )
  }

  if (option.emoji) {
    return (
      <span className="text-base leading-none" aria-hidden>
        {option.emoji}
      </span>
    )
  }

  if (option.icon) {
    return <option.icon className="size-4 shrink-0 text-muted-foreground" />
  }

  return null
}

/**
 * A select built on Popover + Command that covers single, multi, and searchable
 * selection with one API, and renders icon / emoji / status dot / avatar /
 * badge / subtitle options from plain data.
 *
 * Unlike `FacetedFilter`, a pick applies immediately — there is no Apply step —
 * which is what makes it usable as a form control as well as a filter. Pass
 * `name` to also emit hidden inputs so the value survives a native form submit
 * (multi posts as `name[]`).
 */
export function SelectBox(props: SelectBoxProps) {
  const {
    options,
    searchable = false,
    searchPlaceholder = "Search...",
    placeholder = "Select...",
    emptyMessage = "No results found.",
    size = "default",
    clearable = false,
    disabled = false,
    invalid = false,
    indicatorSide = "left",
    name,
    id,
    className,
    contentClassName,
    align = "start",
    showGroupSeparator = true,
  } = props

  const isMulti = props.mode === "multi"
  const maxChips = isMulti ? (props.maxChips ?? 2) : 0
  const keepOpenOnSelect = isMulti ? (props.keepOpenOnSelect ?? true) : false

  const [open, setOpen] = React.useState(false)

  const selected = React.useMemo<string[]>(() => {
    if (isMulti) {
      return props.value ?? []
    }

    return props.value ? [props.value] : []
  }, [isMulti, props.value])

  const optionByValue = React.useMemo(() => {
    const map = new Map<string, SelectOption>()

    options.forEach((option) => map.set(option.value, option))

    return map
  }, [options])

  /** Options in source order, split into groups; ungrouped options come first. */
  const groups = React.useMemo(() => {
    const ordered: { name?: string; options: SelectOption[] }[] = []
    const byName = new Map<string | undefined, SelectOption[]>()

    options.forEach((option) => {
      const key = option.group
      let bucket = byName.get(key)

      if (!bucket) {
        bucket = []
        byName.set(key, bucket)
        ordered.push({ name: key, options: bucket })
      }

      bucket.push(option)
    })

    return ordered
  }, [options])

  const emit = (next: string[]) => {
    if (isMulti) {
      props.onValueChange?.(next)
    } else {
      props.onValueChange?.(next[0] ?? null)
    }
  }

  const handleSelect = (option: SelectOption) => {
    if (isMulti) {
      const next = selected.includes(option.value)
        ? selected.filter((value) => value !== option.value)
        : [...selected, option.value]

      emit(next)

      if (!keepOpenOnSelect) {
        setOpen(false)
      }

      return
    }

    emit(selected[0] === option.value ? [] : [option.value])
    setOpen(false)
  }

  const handleClear = () => {
    emit([])
  }

  const selectedOptions = selected
    .map((value) => optionByValue.get(value))
    .filter((option): option is SelectOption => option !== undefined)

  const hasValue = selectedOptions.length > 0

  const triggerContent = !hasValue ? (
    <span className="truncate">{placeholder}</span>
  ) : isMulti ? (
    <span className="flex flex-wrap items-center gap-1 overflow-hidden">
      {selectedOptions.slice(0, maxChips).map((option) => (
        <Badge key={option.value} variant="secondary" className="max-w-[10rem]">
          <span className="truncate">{option.label}</span>
        </Badge>
      ))}
      {selectedOptions.length > maxChips && (
        <Badge variant="outline">+{selectedOptions.length - maxChips}</Badge>
      )}
    </span>
  ) : (
    <span className="flex items-center gap-2 overflow-hidden">
      <OptionAdornment option={selectedOptions[0]} />
      <span className="truncate">{selectedOptions[0].label}</span>
    </span>
  )

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              type="button"
              role="combobox"
              aria-invalid={invalid || undefined}
              disabled={disabled}
              variant="outline"
              className={cn(
                "w-full justify-between gap-2 font-normal",
                triggerSizeClass[size],
                className,
              )}
            />
          }
        >
          <span className="flex flex-1 items-center overflow-hidden text-left">
            {triggerContent}
          </span>
          <span className="flex shrink-0 items-center gap-1">
            {clearable && hasValue && !disabled && (
              <span
                role="button"
                tabIndex={0}
                aria-label="Clear selection"
                className="rounded-sm text-destructive focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  handleClear()
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    event.stopPropagation()
                    handleClear()
                  }
                }}
              >
                <X className="size-3.5" />
              </span>
            )}
            <ChevronDown className="size-4" />
          </span>
        </PopoverTrigger>
        <PopoverContent
          align={align}
          className={cn(
            "w-[var(--anchor-width)] min-w-[12rem] p-0",
            contentClassName,
          )}
        >
          <Command>
            {searchable && <CommandInput placeholder={searchPlaceholder} />}
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              {groups.map((group, groupIndex) => (
                <React.Fragment key={group.name ?? `__ungrouped-${groupIndex}`}>
                  {groupIndex > 0 && showGroupSeparator && <CommandSeparator />}
                  <CommandGroup heading={group.name}>
                    {group.options.map((option) => {
                      const isSelected = selected.includes(option.value)

                      const indicator = isMulti ? (
                        <span
                          className={cn(
                            "flex size-3.5 shrink-0 items-center justify-center rounded-[4px] border",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-input",
                          )}
                        >
                          {isSelected && <Check className="size-3" />}
                        </span>
                      ) : (
                        <Check
                          className={cn(
                            "size-4 shrink-0",
                            isSelected ? "opacity-100" : "opacity-0",
                          )}
                        />
                      )

                      return (
                        <CommandItem
                          key={option.value}
                          value={option.label}
                          keywords={[option.value, ...(option.keywords ?? [])]}
                          disabled={option.disabled}
                          onSelect={() => handleSelect(option)}
                          className="gap-2"
                        >
                          {indicatorSide === "left" && indicator}
                          <OptionAdornment option={option} />
                          <span className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate">{option.label}</span>
                            {option.description && (
                              <span className="truncate text-xs text-muted-foreground">
                                {option.description}
                              </span>
                            )}
                          </span>
                          {/*
                           * `data-slot="command-shortcut"` suppresses the
                           * check mark CommandItem renders on its own, so
                           * this component controls the indicator itself.
                           */}
                          <span
                            data-slot="command-shortcut"
                            className="ml-auto flex shrink-0 items-center gap-2"
                          >
                            {option.badge && (
                              <Badge
                                variant={option.badge.variant ?? "secondary"}
                              >
                                {option.badge.label}
                              </Badge>
                            )}
                            {indicatorSide === "right" && indicator}
                          </span>
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                </React.Fragment>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {name &&
        (isMulti ? (
          selected.map((value) => (
            <input key={value} type="hidden" name={`${name}[]`} value={value} />
          ))
        ) : (
          <input type="hidden" name={name} value={selected[0] ?? ""} />
        ))}
    </>
  )
}
