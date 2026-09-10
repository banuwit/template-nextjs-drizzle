import Heading from "@/components/heading"
import { AppLayout } from "@/components/layouts/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ParametersLoading() {
  return (
    <AppLayout breadcrumbs={[{ label: "Parameters" }]}>
      <div className="flex h-full flex-1 flex-col gap-6 p-4">
        <Heading
          variant="small"
          title="Parameters"
          description="Kelola parameter referensi yang dipakai lintas modul."
        />

        <Card className="gap-0 overflow-hidden py-0">
          <CardContent className="flex flex-col gap-4 p-4">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-9 w-full max-w-sm" />
              <Skeleton className="h-9 w-36" />
            </div>
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
