"use client"

import { useState } from "react"
import { PlusIcon } from "lucide-react"

import Heading from "@/components/heading"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { City } from "@/db/schema"

import { CityFormDialog } from "./city-form-dialog"
import { CityListTable } from "./city-list-table"
import { CityViewDialog } from "./city-view-dialog"

type DialogMode = "create" | "view" | "edit" | null

export function CityWorkspace({
  cities,
}: {
  cities: City[]
}) {
  const [mode, setMode] = useState<DialogMode>(null)
  const [selected, setSelected] = useState<City>()

  function close() {
    setMode(null)
    setSelected(undefined)
  }

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <Heading title="Cities" />
        <Button
          type="button"
          onClick={() => {
            setSelected(undefined)
            setMode("create")
          }}
        >
          <PlusIcon data-icon="inline-start" />
          Add New
        </Button>
      </div>

      <Card className="gap-0 overflow-hidden py-0">
        <CardContent className="flex flex-col gap-4 p-4">
          <CityListTable
            cities={cities}
            onView={(city) => {
              setSelected(city)
              setMode("view")
            }}
            onEdit={(city) => {
              setSelected(city)
              setMode("edit")
            }}
          />
        </CardContent>
      </Card>

      {mode === "create" ? (
        <CityFormDialog mode="create" onClose={close} />
      ) : null}
      {mode === "edit" && selected ? (
        <CityFormDialog mode="edit" city={selected} onClose={close} />
      ) : null}
      {mode === "view" && selected ? (
        <CityViewDialog city={selected} onClose={close} />
      ) : null}
    </>
  )
}
