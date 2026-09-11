import type { Metadata } from "next"

import Heading from "@/components/heading"
import { AppLayout } from "@/components/layouts/app-layout"
import { Card, CardContent } from "@/components/ui/card"

import { createUser } from "../actions"
import { UserForm } from "../components/user-form"

export const metadata: Metadata = {
  title: "Add New User",
}

export default function NewUserPage() {
  return (
    <AppLayout
      breadcrumbs={[{ label: "Users", href: "/users" }, { label: "Add New" }]}
    >
      <div className="flex h-full min-w-0 flex-1 flex-col gap-6 p-4">
        <Heading variant="small" title="Add New User" />

        <Card className="max-w-xl">
          <CardContent>
            <UserForm action={createUser} submitLabel="Save" withPassword />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
