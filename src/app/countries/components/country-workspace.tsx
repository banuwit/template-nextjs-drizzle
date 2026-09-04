"use client"

import { useState, type ReactNode } from "react"
import { PlusIcon } from "lucide-react"

import Heading from "@/components/heading"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Country } from "@/db/schema"

import { CountryFormDialog } from "./country-form-dialog"
import { CountryTable } from "./country-table"
import { CountryViewDialog } from "./country-view-dialog"

type DialogMode = "create" | "view" | "edit" | null

export function CountryWorkspace({
  countries,
  offset,
  emptyMessage,
  search,
  pagination,
}: {
  countries: Country[]
  offset: number
  emptyMessage: string
  search: ReactNode
  pagination: ReactNode
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
        <Heading
          variant="small"
          title="Countries"
          description="Kelola negara yang tersedia di workspace ini."
        />
        <Button
          type="button"
          onClick={() => {
            setSelected(undefined)
            setMode("create")
          }}
        >
          <PlusIcon data-icon="inline-start" />
          Negara baru
        </Button>
      </div>

      <Card className="gap-0 overflow-hidden py-0">
        <CardContent className="flex flex-col gap-4 p-4">
          {search}
          <CountryTable
            countries={countries}
            offset={offset}
            emptyMessage={emptyMessage}
            onView={(country) => {
              setSelected(country)
              setMode("view")
            }}
            onEdit={(country) => {
              setSelected(country)
              setMode("edit")
            }}
          />
          {pagination}
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
