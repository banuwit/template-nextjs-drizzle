"use client"

import { SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function CitySearchForm({ search }: { search: string }) {
  return (
    <form action="/cities" className="flex w-full items-center gap-2">
      <label htmlFor="city-search" className="sr-only">
        Cari nama atau kode
      </label>
      <Input
        id="city-search"
        name="search"
        type="search"
        placeholder="Cari nama atau kode..."
        defaultValue={search}
        className="min-w-0 flex-1"
      />
      <Button type="submit" variant="outline">
        <SearchIcon data-icon="inline-start" />
        Cari
      </Button>
    </form>
  )
}
