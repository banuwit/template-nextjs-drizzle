"use client"

import { useState } from "react"
import { PlusIcon } from "lucide-react"

import Heading from "@/components/heading"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Province } from "@/db/schema"

import { ProvinceFormDialog } from "./province-form-dialog"
import { ProvinceListTable } from "./province-list-table"
import { ProvinceViewDialog } from "./province-view-dialog"

type DialogMode = "create" | "view" | "edit" | null

export function ProvinceWorkspace({
  provinces,
}: {
  provinces: Province[]
}) {
  const [mode, setMode] = useState<DialogMode>(null)
  const [selected, setSelected] = useState<Province>()

  function close() {
    setMode(null)
    setSelected(undefined)
  }

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <Heading
          variant="small"
          title="Provinces"
          description="Kelola provinsi yang tersedia di workspace ini."
        />
        <Button
          type="button"
          onClick={() => {
            setSelected(undefined)
            setMode("create")
          }}
        >
          <PlusIcon data-icon="inline-start" />
          Provinsi baru
        </Button>
      </div>

      <Card className="gap-0 overflow-hidden py-0">
        <CardContent className="flex flex-col gap-4 p-4">
          <ProvinceListTable
            provinces={provinces}
            onView={(province) => {
              setSelected(province)
              setMode("view")
            }}
            onEdit={(province) => {
              setSelected(province)
              setMode("edit")
            }}
          />
        </CardContent>
      </Card>

      {mode === "create" ? (
        <ProvinceFormDialog mode="create" onClose={close} />
      ) : null}
      {mode === "edit" && selected ? (
        <ProvinceFormDialog mode="edit" province={selected} onClose={close} />
      ) : null}
      {mode === "view" && selected ? (
        <ProvinceViewDialog province={selected} onClose={close} />
      ) : null}
    </>
  )
}
