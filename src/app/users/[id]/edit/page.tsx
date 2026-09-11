import type { Metadata } from "next"
import { notFound } from "next/navigation"

import Heading from "@/components/heading"
import { AppLayout } from "@/components/layouts/app-layout"
import { Card, CardContent } from "@/components/ui/card"

import { updateUser } from "../../actions"
import { UserForm } from "../../components/user-form"
import { getUserById } from "../../queries"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: PageProps<"/users/[id]/edit">): Promise<Metadata> {
  const { id } = await params
  const user = await getUserById(id)

  return {
    title: user ? `Edit ${user.name}` : "Edit user",
  }
}

export default async function EditUserPage({
  params,
}: PageProps<"/users/[id]/edit">) {
  const { id } = await params
  const user = await getUserById(id)

  if (!user) {
    notFound()
  }

  return (
    <AppLayout
      breadcrumbs={[
        { label: "Users", href: "/users" },
        { label: user.name, href: `/users/${user.id}` },
        { label: "Edit" },
      ]}
    >
      <div className="flex h-full min-w-0 flex-1 flex-col gap-6 p-4">
        <Heading variant="small" title="Edit user" />

        <Card className="max-w-xl">
          <CardContent>
            <UserForm
              action={updateUser.bind(null, user.id)}
              defaultValues={{ name: user.name, email: user.email }}
              submitLabel="Save changes"
              cancelHref={`/users/${user.id}`}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
