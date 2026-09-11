"use client"

import { useState } from "react"
import { PlusIcon } from "lucide-react"

import Heading from "@/components/heading"
import { Button } from "@/components/ui/button"
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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <Heading variant="default" title="Parameters" />
          <Button type="button" onClick={() => setSheet({ type: "create" })}>
            <PlusIcon data-icon="inline-start" />
            Add New
          </Button>
        </div>

        <Card className="gap-0 overflow-hidden py-0">
          <CardContent className="flex flex-col gap-4 p-4">
            <ParameterListTable
              parameters={parameters}
              groups={groups}
              onView={(parameter) => setSheet({ type: "view", parameter })}
              onEdit={(parameter) => setSheet({ type: "edit", parameter })}
            />
          </CardContent>
        </Card>
      </div>
    </ParameterSheets>
  )
}
