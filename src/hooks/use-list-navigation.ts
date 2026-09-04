"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"

/** Nilai yang boleh muncul di query string sebuah list. */
export type QueryValue = string | string[] | number | undefined

/**
 * Nilai default yang sudah diterapkan oleh `queries.ts` di server. Param yang
 * sama dengan defaultnya dibuang dari URL supaya address bar tetap bersih.
 */
export interface ListNavigationDefaults {
  sort?: string
  direction?: string
  perPage?: number
}

/**
 * Navigasi untuk list yang di-drive server (`DataTableServer`, `DataGridServer`).
 *
 * Menulis state list ke query string dan membiarkan Server Component
 * mengambil ulang datanya. `router.replace` dipakai (bukan `push`) supaya
 * mengetik di kotak search tidak menumpuk puluhan entri di riwayat browser;
 * `scroll: false` menjaga posisi scroll saat pindah halaman.
 *
 * @param url Pathname tujuan, mis. `/users`. Default: pathname saat ini.
 */
export function useListNavigation(
  url: string | undefined,
  defaults: ListNavigationDefaults = {},
) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = React.useTransition()

  const target = url ?? pathname
  const {
    sort: defaultSort,
    direction: defaultDirection = "desc",
    perPage: defaultPerPage,
  } = defaults

  const visit = React.useCallback(
    (values: Record<string, QueryValue>) => {
      const query = new URLSearchParams()

      Object.entries(values).forEach(([key, value]) => {
        if (value === undefined || value === "") {
          return
        }

        if (Array.isArray(value)) {
          // Facet multi-select dikirim sebagai `key=a&key=b`; Next.js
          // mengembalikannya ke page sebagai `string[]`.
          value.forEach((entry) => {
            if (entry !== "") query.append(key, entry)
          })

          return
        }

        if (key === "page" && Number(value) === 1) return
        if (key === "sort" && value === defaultSort) return
        if (key === "direction" && value === defaultDirection) return
        if (key === "per_page" && Number(value) === defaultPerPage) return

        query.set(key, String(value))
      })

      const search = query.toString()

      startTransition(() => {
        router.replace(search ? `${target}?${search}` : target, {
          scroll: false,
        })
      })
    },
    [router, target, defaultSort, defaultDirection, defaultPerPage],
  )

  return { visit, isPending }
}
