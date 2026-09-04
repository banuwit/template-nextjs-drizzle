import { format } from "date-fns"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Province } from "@/db/schema"

import { ProvinceRowActions } from "./province-row-actions"

const COLUMN_COUNT = 5

export function ProvinceTable({
  provinces,
  offset,
  emptyMessage,
  onView,
  onEdit,
}: {
  provinces: Province[]
  offset: number
  emptyMessage: string
  onView: (province: Province) => void
  onEdit: (province: Province) => void
}) {
  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead className="w-12">No.</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Kode</TableHead>
            <TableHead>Dibuat</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {provinces.length ? (
            provinces.map((province, index) => (
              <TableRow key={province.id}>
                <TableCell className="tabular-nums text-muted-foreground">
                  {offset + index + 1}
                </TableCell>
                <TableCell className="font-medium">
                  <button
                    type="button"
                    className="hover:underline"
                    onClick={() => onView(province)}
                  >
                    {province.name}
                  </button>
                </TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {province.code}
                </TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {format(province.createdAt, "dd MMM yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <ProvinceRowActions
                    province={province}
                    onView={onView}
                    onEdit={onEdit}
                  />
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
