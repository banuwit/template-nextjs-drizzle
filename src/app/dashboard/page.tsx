import type { Metadata } from "next"

import Heading from "@/components/heading"
import { AppLayout } from "@/components/layouts/app-layout"

export const metadata: Metadata = {
  title: "Dashboard",
}

export default function Page() {
  return (
    <AppLayout breadcrumbs={[{ label: "Dashboard" }]}>
      <div className="flex min-w-0 flex-1 flex-col gap-4 p-4">
        <Heading title="Dashboard" />
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="aspect-video rounded-xl bg-card border" />
          <div className="aspect-video rounded-xl bg-card border" />
          <div className="aspect-video rounded-xl bg-card border" />
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl bg-card border md:min-h-min" />
      </div>
    </AppLayout>
  )
}
