import type { Paginated } from "@/types/pagination"

export interface PaginateInput<T> {
  rows: T[]
  /** Total baris yang cocok dengan filter, bukan hanya yang ada di halaman ini. */
  total: number
  /** 1-based. */
  page: number
  perPage: number
}

/**
 * Bungkus satu halaman hasil query Drizzle menjadi `Paginated<T>`.
 *
 * Menghitung `last_page` / `from` / `to` di satu tempat supaya tiap `queries.ts`
 * tidak mengulang aritmatika off-by-one yang sama.
 */
export function paginate<T>({
  rows,
  total,
  page,
  perPage,
}: PaginateInput<T>): Paginated<T> {
  // Tetap 1 saat tidak ada baris: pagination yang menampilkan "Halaman 1 dari 0"
  // membingungkan, dan `page > last_page` akan memicu redirect yang tidak perlu.
  const lastPage = Math.max(1, Math.ceil(total / perPage))
  const from = rows.length > 0 ? (page - 1) * perPage + 1 : null

  return {
    data: rows,
    current_page: page,
    last_page: lastPage,
    per_page: perPage,
    total,
    from,
    to: from === null ? null : from + rows.length - 1,
  }
}
