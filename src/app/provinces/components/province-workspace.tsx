"use client"

import { useState, type ReactNode } from "react"
import { PlusIcon } from "lucide-react"

import Heading from "@/components/heading"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Province } from "@/db/schema"

import { ProvinceFormSheet } from "./province-form-sheet"
import { ProvinceTable } from "./province-table"
import { ProvinceViewSheet } from "./province-view-sheet"

type SheetMode = "create" | "view" | "edit" | null

export function ProvinceWorkspace({
  provinces,
  offset,
  emptyMessage,
  search,
  pagination,
}: {
  provinces: Province[]
  offset: number
  emptyMessage: string
  search: ReactNode
  pagination: ReactNode
}) {
  const [mode, setMode] = useState<SheetMode>(null)
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
          {search}
          <ProvinceTable
            provinces={provinces}
            offset={offset}
            emptyMessage={emptyMessage}
            onView={(province) => {
              setSelected(province)
              setMode("view")
            }}
            onEdit={(province) => {
              setSelected(province)
              setMode("edit")
            }}
          />
          {pagination}
        </CardContent>
      </Card>

      {mode === "create" ? (
        <ProvinceFormSheet mode="create" onClose={close} />
      ) : null}
      {mode === "edit" && selected ? (
        <ProvinceFormSheet mode="edit" province={selected} onClose={close} />
      ) : null}
      {mode === "view" && selected ? (
        <ProvinceViewSheet province={selected} onClose={close} />
      ) : null}
    </>
  )
}
