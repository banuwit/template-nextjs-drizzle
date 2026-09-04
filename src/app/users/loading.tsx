import Heading from "@/components/heading"
import { AppLayout } from "@/components/layouts/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function UsersLoading() {
  return (
    <AppLayout breadcrumbs={[{ label: "Users" }]}>
      <div className="flex h-full flex-1 flex-col gap-6 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <Heading
            variant="small"
            title="Users"
            description="Kelola user yang terdaftar di workspace ini."
          />
          <Skeleton className="h-9 w-28" />
        </div>

        <Card className="gap-0 overflow-hidden py-0">
          <CardContent className="flex flex-col gap-4 p-4">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-9 w-full max-w-sm" />
              <Skeleton className="h-8 w-20" />
            </div>
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
