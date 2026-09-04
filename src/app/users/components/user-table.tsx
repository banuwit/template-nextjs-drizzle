import Link from "next/link"
import { format } from "date-fns"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { User } from "@/db/schema"

import { UserRowActions } from "./user-row-actions"

const COLUMN_COUNT = 5

export function UserTable({
  users,
  /** Nomor baris pertama - 1, supaya kolom "No." lanjut di halaman berikutnya. */
  offset,
  emptyMessage,
}: {
  users: User[]
  offset: number
  emptyMessage: string
}) {
  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead className="w-12">No.</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Dibuat</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length ? (
            users.map((user, index) => (
              <TableRow key={user.id}>
                <TableCell className="tabular-nums text-muted-foreground">
                  {offset + index + 1}
                </TableCell>
                <TableCell className="font-medium">
                  <Link href={`/users/${user.id}`} className="hover:underline">
                    {user.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {format(user.createdAt, "dd MMM yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <UserRowActions user={{ id: user.id, name: user.name }} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={COLUMN_COUNT} className="h-24 text-center">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
