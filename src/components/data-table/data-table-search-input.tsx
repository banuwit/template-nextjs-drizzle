import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface DataTableSearchInputProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  className?: string
}

export function DataTableSearchInput({
  placeholder = "Search...",
  value,
  onChange,
  className,
}: DataTableSearchInputProps) {
  return (
    <div className={cn("relative w-48", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="pl-8"
        aria-label={placeholder}
      />
    </div>
  )
}
