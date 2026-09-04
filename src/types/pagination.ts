/**
 * Bentuk paginator yang dipakai semua list server-driven (`DataTableServer`,
 * `DataGridServer`).
 *
 * Nama field-nya snake_case karena mengikuti bentuk paginator Laravel — dipertahankan
 * apa adanya supaya komponen tabel/grid tidak perlu diubah. Bangun bentuk ini dari
 * hasil query Drizzle lewat `paginate()` di `@/lib/pagination`.
 */
export interface Paginated<T> {
  data: T[]
  /** 1-based. */
  current_page: number
  /** Minimal 1, bahkan saat tidak ada baris sama sekali. */
  last_page: number
  per_page: number
  total: number
  /** Nomor baris pertama di halaman ini (1-based); `null` kalau halaman kosong. */
  from: number | null
  /** Nomor baris terakhir di halaman ini; `null` kalau halaman kosong. */
  to: number | null
}
