"use client"

import { useState } from "react"
import { PlusIcon } from "lucide-react"

import Heading from "@/components/heading"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Country } from "@/db/schema"

import { CountryFormDialog } from "./country-form-dialog"
import { CountryListTable } from "./country-list-table"
import { CountryViewDialog } from "./country-view-dialog"

type DialogMode = "create" | "view" | "edit" | null

export function CountryWorkspace({
  countries,
}: {
  countries: Country[]
}) {
  const [mode, setMode] = useState<DialogMode>(null)
  const [selected, setSelected] = useState<Country>()

  function close() {
    setMode(null)
    setSelected(undefined)
  }

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <Heading title="Countries" />
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
          <CountryListTable
            countries={countries}
            onView={(country) => {
              setSelected(country)
              setMode("view")
            }}
            onEdit={(country) => {
              setSelected(country)
              setMode("edit")
            }}
          />
        </CardContent>
      </Card>

      {mode === "create" ? (
        <CountryFormDialog mode="create" onClose={close} />
      ) : null}
      {mode === "edit" && selected ? (
        <CountryFormDialog mode="edit" country={selected} onClose={close} />
      ) : null}
      {mode === "view" && selected ? (
        <CountryViewDialog country={selected} onClose={close} />
      ) : null}
    </>
  )
}
