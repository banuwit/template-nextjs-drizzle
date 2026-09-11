import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon, PencilIcon } from "lucide-react"

import Heading from "@/components/heading"
import { AppLayout } from "@/components/layouts/app-layout"
import { Button } from "@/components/ui/button"

import { UserDetailCard } from "../components/user-detail-card"
import { getUserById } from "../queries"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: PageProps<"/users/[id]">): Promise<Metadata> {
  const { id } = await params
  const user = await getUserById(id)

  return {
    title: user?.name ?? "User",
  }
}

export default async function UserDetailPage({
  params,
}: PageProps<"/users/[id]">) {
  const { id } = await params
  const user = await getUserById(id)

  if (!user) {
    notFound()
  }

  return (
    <AppLayout
      breadcrumbs={[{ label: "Users", href: "/users" }, { label: user.name }]}
    >
      <div className="flex h-full min-w-0 flex-1 flex-col gap-6 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <Heading title={user.name} />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/users" />}
            >
              <ArrowLeftIcon data-icon="inline-start" />
              Back
            </Button>
            <Button
              nativeButton={false}
              render={<Link href={`/users/${user.id}/edit`} />}
            >
              <PencilIcon data-icon="inline-start" />
              Edit
            </Button>
          </div>
        </div>

        <UserDetailCard user={user} />
      </div>
    </AppLayout>
  )
}
