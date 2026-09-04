"use client"

import type { ReactNode } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

import { buildCitiesHref } from "../utils"

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

export function CityPagination({
  page,
  pageCount,
  total,
  search,
}: {
  page: number
  pageCount: number
  total: number
  search: string
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-xs text-muted-foreground">
        {total} kota &middot; halaman {page} dari {pageCount}
      </p>
      <div className="flex items-center gap-2">
        <PageNavButton
          href={buildCitiesHref({ page: page - 1, search })}
          disabled={page <= 1}
        >
          Sebelumnya
        </PageNavButton>
        <PageNavButton
          href={buildCitiesHref({ page: page + 1, search })}
          disabled={page >= pageCount}
        >
          Berikutnya
        </PageNavButton>
      </div>
    </div>
  )
}
