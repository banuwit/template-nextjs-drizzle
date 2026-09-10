"use client"

import { useState } from "react"

import Heading from "@/components/heading"
import { Card, CardContent } from "@/components/ui/card"
import type { Parameter } from "@/db/schema"

import { ParameterListTable } from "./parameter-list-table"
import { ParameterSheets, type ParameterSheet } from "./parameter-sheets"

export function ParameterWorkspace({
  parameters,
  groups,
  nextSortOrder,
}: {
  parameters: Parameter[]
  groups: string[]
  nextSortOrder: number
}) {
  const [sheet, setSheet] = useState<ParameterSheet>({ type: "closed" })

  return (
    <ParameterSheets
      sheet={sheet}
      onSheetChange={setSheet}
      groups={groups}
      nextSortOrder={nextSortOrder}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-6 p-4">
        <Heading
          variant="small"
          title="Parameters"
          description="Kelola parameter referensi yang dipakai lintas modul."
        />

        <Card className="gap-0 overflow-hidden py-0">
          <CardContent className="flex flex-col gap-4 p-4">
            <ParameterListTable
              parameters={parameters}
              groups={groups}
              onCreate={() => setSheet({ type: "create" })}
              onView={(parameter) => setSheet({ type: "view", parameter })}
              onEdit={(parameter) => setSheet({ type: "edit", parameter })}
            />
          </CardContent>
        </Card>
      </div>
    </ParameterSheets>
  )
}
