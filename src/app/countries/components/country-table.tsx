import { format } from "date-fns"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Country } from "@/db/schema"

import { CountryRowActions } from "./country-row-actions"

const COLUMN_COUNT = 5

export function CountryTable({
  countries,
  offset,
  emptyMessage,
  onView,
  onEdit,
}: {
  countries: Country[]
  offset: number
  emptyMessage: string
  onView: (country: Country) => void
  onEdit: (country: Country) => void
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
          {countries.length ? (
            countries.map((country, index) => (
              <TableRow key={country.id}>
                <TableCell className="tabular-nums text-muted-foreground">
                  {offset + index + 1}
                </TableCell>
                <TableCell className="font-medium">
                  <button
                    type="button"
                    className="hover:underline"
                    onClick={() => onView(country)}
                  >
                    {country.name}
                  </button>
                </TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {country.code}
                </TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {format(country.createdAt, "dd MMM yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <CountryRowActions
                    country={country}
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
