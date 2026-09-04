import { SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function CountrySearchForm({ search }: { search: string }) {
  return (
    <form action="/countries" className="flex w-full items-center gap-2">
      <label htmlFor="country-search" className="sr-only">
        Cari nama atau kode
      </label>
      <Input
        id="country-search"
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
