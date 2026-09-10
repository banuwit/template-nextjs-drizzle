"use client"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"

export default function ParametersError({
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-4">
      <Empty className="max-w-md border">
        <EmptyHeader>
          <EmptyTitle>Gagal memuat parameters</EmptyTitle>
          <EmptyDescription>
            Terjadi kesalahan saat mengambil data. Coba muat ulang halaman ini.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={() => retry()}>Coba lagi</Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
