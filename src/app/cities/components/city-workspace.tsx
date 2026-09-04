"use client"

import { useState } from "react"
import { PlusIcon } from "lucide-react"

import Heading from "@/components/heading"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { City } from "@/db/schema"

import { CityListTable } from "./city-list-table"
import { CityPagination } from "./city-pagination"
import { CitySearchForm } from "./city-search-form"
import { CitySheets, type CitySheet } from "./city-sheets"

export function CityWorkspace({
  cities,
  offset,
  emptyMessage,
  q,
  page,
  pageCount,
  total,
}: {
  cities: City[]
  offset: number
  emptyMessage: string
  q: string
  page: number
  pageCount: number
  total: number
}) {
  const [sheet, setSheet] = useState<CitySheet>({ type: "closed" })

  return (
    <CitySheets sheet={sheet} onSheetChange={setSheet}>
      <div className="flex min-h-0 flex-1 flex-col gap-6 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <Heading
            variant="small"
            title="Cities"
            description="Kelola kota yang tersedia di workspace ini."
          />
          <Button
            type="button"
            onClick={() => setSheet({ type: "create" })}
          >
            <PlusIcon data-icon="inline-start" />
            Kota baru
          </Button>
        </div>

        <Card className="gap-0 overflow-hidden py-0">
          <CardContent className="flex flex-col gap-4 p-4">
            <CitySearchForm q={q} />
            <CityListTable
              cities={cities}
              offset={offset}
              emptyMessage={emptyMessage}
              onView={(city) => setSheet({ type: "view", city })}
              onEdit={(city) => setSheet({ type: "edit", city })}
            />
            <CityPagination
              page={page}
              pageCount={pageCount}
              total={total}
              q={q}
            />
          </CardContent>
        </Card>
      </div>
    </CitySheets>
  )
}
