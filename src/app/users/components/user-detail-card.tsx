import { format } from "date-fns"

import { Card, CardContent } from "@/components/ui/card"
import type { User } from "@/db/schema"

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b py-3 last:border-b-0 sm:flex-row sm:items-center sm:gap-4">
      <span className="w-32 shrink-0 text-xs text-muted-foreground">
        {label}
      </span>
      <span className="text-sm">{value}</span>
    </div>
  )
}

export function UserDetailCard({ user }: { user: User }) {
  return (
    <Card className="max-w-xl">
      <CardContent>
        <DetailRow label="ID" value={String(user.id)} />
      <DetailRow label="Name" value={user.name} />
      <DetailRow label="Email" value={user.email} />
      <DetailRow
        label="Created"
          value={format(user.createdAt, "dd MMM yyyy, HH:mm")}
        />
      </CardContent>
    </Card>
  )
}
