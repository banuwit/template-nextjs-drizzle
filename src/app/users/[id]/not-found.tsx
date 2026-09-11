import Link from "next/link"
import { UsersIcon } from "lucide-react"

import Heading from "@/components/heading"
import { AppLayout } from "@/components/layouts/app-layout"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function UserNotFound() {
  return (
    <AppLayout
      breadcrumbs={[
        { label: "Users", href: "/users" },
        { label: "Not found" },
      ]}
    >
      <div className="flex h-full min-w-0 flex-1 flex-col gap-6 p-4">
        <Heading title="Not found" />
        <Empty className="flex-1 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UsersIcon />
            </EmptyMedia>
            <EmptyTitle>User not found</EmptyTitle>
            <EmptyDescription>
              This user does not exist or has been deleted.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button nativeButton={false} render={<Link href="/users" />}>
              Back to Users
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    </AppLayout>
  )
}
