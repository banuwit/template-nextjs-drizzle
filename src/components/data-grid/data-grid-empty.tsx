import { InboxIcon } from "lucide-react"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

interface DataGridEmptyProps {
  title?: string
  description?: string
}

export function DataGridEmpty({
  title = "No data",
  description = "No data available yet. Try adjusting your filter or search.",
}: DataGridEmptyProps) {
  return (
    <Empty className="border-0 py-12">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <InboxIcon className="text-muted-foreground" />
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
