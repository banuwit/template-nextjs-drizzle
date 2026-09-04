import type { Metadata } from "next"

import Heading from "@/components/heading"
import { AppLayout } from "@/components/layouts/app-layout"
import { Card, CardContent } from "@/components/ui/card"

import { createUser } from "../actions"
import { UserForm } from "../components/user-form"

export const metadata: Metadata = {
  title: "User baru",
}

export default function NewUserPage() {
  return (
    <AppLayout
      breadcrumbs={[{ label: "Users", href: "/users" }, { label: "Baru" }]}
    >
      <div className="flex h-full flex-1 flex-col gap-6 p-4">
        <Heading
          variant="small"
          title="User baru"
          description="Tambahkan user baru ke workspace."
        />

        <Card className="max-w-xl">
          <CardContent>
            <UserForm action={createUser} submitLabel="Buat user" />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
