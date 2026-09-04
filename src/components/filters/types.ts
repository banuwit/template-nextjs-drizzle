import type * as React from "react"

/** How many options a filter lets the user pick at once. */
export type FilterSelectionVariant = "single" | "multi"

/** One selectable entry in a filter list. */
export interface FilterOption {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
}

/** A badge rendered at the trailing edge of an option. */
export interface SelectOptionBadge {
  label: string
  variant?:
    "default" | "secondary" | "destructive" | "outline" | "ghost" | "link"
}

export interface SelectOptionAvatar {
  src?: string
  /** Initials shown while the image loads or when `src` is omitted. */
  fallback: string
}

/**
 * A richer option than {@link FilterOption}. Every adornment is optional — one
 * option type covers icon, emoji/flag, status dot, avatar, badge, and subtitle
 * presentations instead of a separate component per style.
 */
export interface SelectOption extends FilterOption {
  /** Secondary line rendered under the label. */
  description?: string
  /** Tailwind background class for a status dot, e.g. `bg-emerald-500`. */
  color?: string
  /** Emoji or flag rendered before the label. */
  emoji?: string
  avatar?: SelectOptionAvatar
  badge?: SelectOptionBadge
  /** Options sharing a group render together under this heading. */
  group?: string
  disabled?: boolean
  /** Extra terms the search box matches against. */
  keywords?: string[]
}
