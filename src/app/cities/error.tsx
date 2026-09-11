"use client"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"

export default function CitiesError({
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-4">
      <Empty className="max-w-md border">
        <EmptyHeader>
          <EmptyTitle>Failed to load cities</EmptyTitle>
          <EmptyDescription>
            Something went wrong while fetching data. Try reloading this page.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={() => retry()}>Try again</Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
