import Link from "next/link"
import { UsersIcon } from "lucide-react"

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
        { label: "Tidak ditemukan" },
      ]}
    >
      <div className="flex h-full flex-1 flex-col gap-6 p-4">
        <Empty className="flex-1 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UsersIcon />
            </EmptyMedia>
            <EmptyTitle>User tidak ditemukan</EmptyTitle>
            <EmptyDescription>
              User ini tidak ada atau sudah dihapus.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button nativeButton={false} render={<Link href="/users" />}>
              Kembali ke Users
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    </AppLayout>
  )
}
