/**
 * Helper error database yang dipakai lintas fitur.
 *
 * Ditaruh di `src/lib/` (bukan di folder fitur) karena setiap fitur yang punya
 * kolom unique membutuhkannya — jangan disalin ulang per halaman.
 */

/** Kode Postgres untuk unique_violation. */
const UNIQUE_VIOLATION = "23505"

/**
 * Drizzle membungkus error `pg` dalam `DrizzleQueryError`, jadi `code` ada di
 * `.cause` — bukan di error terluar. Telusuri rantai cause-nya.
 */
export function isUniqueViolation(error: unknown): boolean {
  let current: unknown = error

  while (typeof current === "object" && current !== null) {
    if ((current as { code?: unknown }).code === UNIQUE_VIOLATION) {
      return true
    }
    current = (current as { cause?: unknown }).cause
  }

  return false
}
