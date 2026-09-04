import { format } from "date-fns"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { City } from "@/db/schema"

import { CityRowActions } from "./city-row-actions"

const COLUMN_COUNT = 5

export function CityListTable({
  cities,
  offset,
  emptyMessage,
  onView,
  onEdit,
}: {
  cities: City[]
  offset: number
  emptyMessage: string
  onView: (city: City) => void
  onEdit: (city: City) => void
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
          {cities.length ? (
            cities.map((city, index) => (
              <TableRow key={city.id}>
                <TableCell className="tabular-nums text-muted-foreground">
                  {offset + index + 1}
                </TableCell>
                <TableCell className="font-medium">
                  <button
                    type="button"
                    className="hover:underline"
                    onClick={() => onView(city)}
                  >
                    {city.name}
                  </button>
                </TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {city.code}
                </TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {format(city.createdAt, "dd MMM yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <CityRowActions
                    city={city}
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
