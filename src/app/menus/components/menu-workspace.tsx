"use client"

import { useState } from "react"
import { PlusIcon } from "lucide-react"

import type { DataTableFilters } from "@/components/data-table/types"
import Heading from "@/components/heading"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Paginated } from "@/types/pagination"

import type { MenuListRow, MenuParentOption } from "../types"
import { collectSubtreeIds } from "../utils/subtree"

import { MenuFormSheet } from "./menu-form-sheet"
import { MenuListTable } from "./menu-list-table"
import { MenuViewSheet } from "./menu-view-sheet"

type SheetMode = "create" | "view" | "edit" | null

export function MenuWorkspace({
  paginated,
  filters,
  layouts,
  parentOptions,
  nextSortOrder,
}: {
  paginated: Paginated<MenuListRow>
  filters: DataTableFilters
  layouts: string[]
  parentOptions: MenuParentOption[]
  nextSortOrder: number
}) {
  const [mode, setMode] = useState<SheetMode>(null)
  const [selected, setSelected] = useState<MenuListRow>()

  function close() {
    setMode(null)
    setSelected(undefined)
  }

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <Heading title="Menus" />
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
          <MenuListTable
            paginated={paginated}
            filters={filters}
            layouts={layouts}
            onView={(menu) => {
              setSelected(menu)
              setMode("view")
            }}
            onEdit={(menu) => {
              setSelected(menu)
              setMode("edit")
            }}
          />
        </CardContent>
      </Card>

      {mode === "create" ? (
        <MenuFormSheet
          mode="create"
          parentOptions={parentOptions}
          layouts={layouts}
          nextSortOrder={nextSortOrder}
          descendantIds={[]}
          onClose={close}
        />
      ) : null}
      {mode === "edit" && selected ? (
        <MenuFormSheet
          mode="edit"
          menu={selected}
          parentOptions={parentOptions}
          layouts={layouts}
          nextSortOrder={nextSortOrder}
          descendantIds={collectSubtreeIds(parentOptions, selected.id)}
          onClose={close}
        />
      ) : null}
      {mode === "view" && selected ? (
        <MenuViewSheet menu={selected} onClose={close} />
      ) : null}
    </>
  )
}
