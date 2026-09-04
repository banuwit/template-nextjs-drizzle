import type { ReactNode } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

import { buildUsersHref } from "../utils"

/**
 * `<Button disabled render={<Link/>}>` merender `<a disabled>` — atribut yang
 * diabaikan browser, jadi link-nya tetap bisa diklik. Saat nonaktif, render
 * `<button disabled>` biasa.
 */
function PageNavButton({
  href,
  disabled,
  children,
}: {
  href: string
  disabled: boolean
  children: ReactNode
}) {
  if (disabled) {
    return (
      <Button variant="outline" size="sm" disabled>
        {children}
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      nativeButton={false}
      render={<Link href={href} />}
    >
      {children}
    </Button>
  )
}

export function UserPagination({
  page,
  pageCount,
  total,
  q,
}: {
  page: number
  pageCount: number
  total: number
  q: string
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-xs text-muted-foreground">
        {total} user &middot; halaman {page} dari {pageCount}
      </p>
      <div className="flex items-center gap-2">
        <PageNavButton
          href={buildUsersHref({ page: page - 1, q })}
          disabled={page <= 1}
        >
          Sebelumnya
        </PageNavButton>
        <PageNavButton
          href={buildUsersHref({ page: page + 1, q })}
          disabled={page >= pageCount}
        >
          Berikutnya
        </PageNavButton>
      </div>
    </div>
  )
}
