import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"

interface DataGridLoadingProps {
  title?: string
  description?: string
}

/**
 * Loading placeholder for `DataGridServer`, shown while an Inertia visit is
 * in flight. Built on the same `Empty` primitive and `border-0 py-12` sizing
 * as `DataGridEmpty` so swapping between the two states doesn't shift the
 * grid's height.
 */
export function DataGridLoading({
  title = "Loading data...",
  description = "Mohon tunggu sebentar.",
}: DataGridLoadingProps) {
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
