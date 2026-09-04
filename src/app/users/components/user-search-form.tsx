import { SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

/**
 * Form GET biasa — submit-nya cuma mengubah query string, jadi tidak perlu
 * client component maupun state.
 */
export function UserSearchForm({ q }: { q: string }) {
  return (
    <form action="/users" className="flex w-full items-center gap-2">
      <label htmlFor="user-search" className="sr-only">
        Cari nama atau email
      </label>
      <Input
        id="user-search"
        name="q"
        type="search"
        placeholder="Cari nama atau email..."
        defaultValue={q}
        className="min-w-0 flex-1"
      />
      <Button type="submit" variant="outline">
        <SearchIcon data-icon="inline-start" />
        Cari
      </Button>
    </form>
  )
}
