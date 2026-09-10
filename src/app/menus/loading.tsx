import Heading from "@/components/heading"
import { AppLayout } from "@/components/layouts/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function MenusLoading() {
  return (
    <AppLayout breadcrumbs={[{ label: "Menus" }]}>
      <div className="flex h-full flex-1 flex-col gap-6 p-4">
        <Heading
          variant="small"
          title="Menus"
          description="Kelola struktur menu yang dirender di sidebar."
        />

        <Card className="gap-0 overflow-hidden py-0">
          <CardContent className="flex flex-col gap-4 p-4">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-9 w-full max-w-sm" />
              <Skeleton className="h-9 w-32" />
            </div>
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
