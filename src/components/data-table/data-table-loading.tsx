import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"

interface DataTableLoadingProps {
  title?: string
  description?: string
}

/**
 * Loading placeholder for `DataTableServer`, shown while an Inertia visit is
 * in flight. Built on the same `Empty` primitive and `border-0 py-12` sizing
 * as `DataTableEmpty` so swapping between the two states doesn't shift the
 * table's height.
 */
export function DataTableLoading({
  title = "Memuat data...",
  description = "Mohon tunggu sebentar.",
}: DataTableLoadingProps) {
  return (
    <Empty className="border-0 py-12">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Spinner className="size-4 text-muted-foreground" />
        </EmptyMedia>
        <EmptyTitle className="text-base text-muted-foreground">
          {title}
        </EmptyTitle>
        <EmptyDescription className="text-center text-xs">
          {description}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
